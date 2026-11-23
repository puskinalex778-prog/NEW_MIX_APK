#!/usr/bin/env python3
"""Генерирует values/strings.xml (русский, по умолчанию) и values-en/strings.xml из словарей."""
import os, re, sys, importlib.util


def load(path):
    spec = importlib.util.spec_from_file_location("m", path)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m.S


def esc(t):
    t = t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    t = t.replace("\\", "\\\\").replace("'", "\\'").replace('"', '\\"')
    t = t.replace("\n", "\\n")
    if t.startswith("@") or t.startswith("?"):
        t = "\\" + t
    return t


def check(key, s):
    args = re.findall(r"%(\d+)\$", s)
    # проценты: всё, что не %N$x и не %%
    bad = re.sub(r"%\d+\$[-0-9.]*[sdf]|%%", "", s)
    if "%" in bad:
        raise SystemExit(f"bad percent in {key}: {s}")
    return sorted(set(args))


def write(res_dir, S, idx):
    os.makedirs(res_dir, exist_ok=True)
    out = ['<?xml version="1.0" encoding="utf-8"?>', "<resources>"]
    for k in sorted(S):
        v = S[k][idx]
        check(k, v)
        has_args = bool(re.search(r"%\d+\$", v))
        if not has_args and "%%" in v:
            v = v.replace("%%", "%")  # без аргументов getString не форматирует
        attr = ' formatted="false"' if (not has_args and "%" in v) else ""
        out.append(f'    <string name="{k}"{attr}>{esc(v)}</string>')
    out.append("</resources>")
    open(os.path.join(res_dir, "strings.xml"), "w", encoding="utf-8").write("\n".join(out) + "\n")


if __name__ == "__main__":
    res = sys.argv[1]
    S = {}
    for p in sys.argv[2:]:
        part = load(p)
        dup = set(S) & set(part)
        if dup:
            raise SystemExit(f"duplicate keys: {dup}")
        S.update(part)
    for k, (ru, en) in S.items():
        if check(k, ru) != check(k, en):
            raise SystemExit(f"arg mismatch {k}")
    write(os.path.join(res, "values"), S, 0)
    write(os.path.join(res, "values-en"), S, 1)
    print(len(S), "strings")

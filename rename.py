a="""new file:   src/control/DragManager.ts
new file:   src/control/KeyboardManager.ts
new file:   src/engine/DiffModeManager.ts
new file:   src/engine/RandomMapper.ts
new file:   src/patternlang/borderType.ts"""

# first rename strategy
if False:
    d = {}
    for line in a.split("\n"):
        tag, name = line.split(":   ")
        low = name.lower()
        if low in d:
            otag, oname = d[low].split(":   ")
            if tag != otag and low == oname.lower():
                old, new = (name, oname) if otag == "new file" else (oname, name)
                print(f"git mv -f {old} {new}")
            del d[low]
        else:
            d[low] = line

    print("\n".join(d))


# second rename strategy
if False:
    for line in a.split("\n"):
        tag, name = line.split(":   ")
        print(f"git mv -f {name.lower()} {name}")

# third rename strategy
for line in a.split("\n"):
    tag, name = line.split(":   ")
    stem = name.split("/")[-1]
    stem = stem[0].lower() + stem[1:]
    low = "/".join([*name.split("/")[:-1], stem])
    print(f"git mv -f {low} {name}")

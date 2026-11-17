# 03_materials.py
# Purpose: M3 materials. 4K pine bark on every spruce trunk (box projection, no UVs needed),
#          weathered bark on deadwood, a moss + needle-litter forest floor, darker spruce
#          needles, a slightly glossy wendigo skin.
# Input:   output/nightfall-stalked/blend/stalked_v002.blend, textures from 03a_textures.py,
#          Game 2 Ground037 textures (read only)
# Output:  output/nightfall-stalked/blend/stalked_v003.blend
# Run:     blender --background --factory-startup blend/stalked_v002.blend --python 03_materials.py
import bpy

ROOT = "C:/Users/arins/Arin/School/Projects/Portfolio/output/nightfall-stalked"
TEX = f"{ROOT}/textures"
GAME_TEX = "C:/Users/arins/Arin/School/Game Dev/Game 2/assests/textures"


def img(path, colour):
    i = bpy.data.images.load(path, check_existing=True)
    i.colorspace_settings.name = "sRGB" if colour else "Non-Color"
    return i


def fresh(mat):
    """Clear a material down to one Principled BSDF and its output; return (nodes, links, bsdf)."""
    mat.use_nodes = True
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    for n in list(nodes):
        if n.type not in {"BSDF_PRINCIPLED", "OUTPUT_MATERIAL"}:
            nodes.remove(n)
    bsdf = next(n for n in nodes if n.type == "BSDF_PRINCIPLED")
    out = next(n for n in nodes if n.type == "OUTPUT_MATERIAL")
    if not bsdf.outputs[0].links:
        links.new(bsdf.outputs[0], out.inputs["Surface"])
    bsdf.inputs["Metallic"].default_value = 0.0
    return nodes, links, bsdf


def tex(nodes, links, vector, image, box=False):
    t = nodes.new("ShaderNodeTexImage")
    t.image = image
    if box:
        t.projection, t.projection_blend = "BOX", 0.25
    links.new(vector, t.inputs["Vector"])
    return t


def bark(mat, saturation, value, rough_add, tile=0.85):
    """Pine bark projected from the sides in object space, so furrows run along the trunk."""
    nodes, links, bsdf = fresh(mat)
    coords = nodes.new("ShaderNodeTexCoord")
    mapping = nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (1 / tile,) * 3
    links.new(coords.outputs["Object"], mapping.inputs["Vector"])
    v = mapping.outputs["Vector"]

    diff = tex(nodes, links, v, img(f"{TEX}/pine_bark_diff_4k.jpg", True), box=True)
    hsv = nodes.new("ShaderNodeHueSaturation")
    hsv.inputs["Saturation"].default_value = saturation
    hsv.inputs["Value"].default_value = value
    links.new(diff.outputs["Color"], hsv.inputs["Color"])
    links.new(hsv.outputs["Color"], bsdf.inputs["Base Color"])

    arm = tex(nodes, links, v, img(f"{TEX}/pine_bark_arm_4k.jpg", False), box=True)
    sep = nodes.new("ShaderNodeSeparateColor")
    links.new(arm.outputs["Color"], sep.inputs["Color"])
    rough = nodes.new("ShaderNodeMath")
    rough.operation, rough.use_clamp = "ADD", True
    rough.inputs[1].default_value = rough_add
    links.new(sep.outputs["Green"], rough.inputs[0])
    links.new(rough.outputs[0], bsdf.inputs["Roughness"])

    # bump from height, not the tangent-space normal map, which doesn't match a box projection
    disp = tex(nodes, links, v, img(f"{TEX}/pine_bark_disp_4k.png", False), box=True)
    bump = nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.8
    bump.inputs["Distance"].default_value = 0.03
    links.new(disp.outputs["Color"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])


# --- bark: the spruce trunk material (shared by every tree and sapling) and deadwood --------
bark(bpy.data.materials["Tree_0Mat"], saturation=0.42, value=0.7, rough_add=0.05)
bark(bpy.data.materials["Deadwood"], saturation=0.2, value=0.5, rough_add=0.15)

# --- needles: darker, cooler spruce green (alpha cut-outs untouched) ------------------------
for name in ("Tree_1Mat", "Tree_2Mat"):
    nt = bpy.data.materials[name].node_tree
    bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
    link = bsdf.inputs["Base Color"].links[0]
    if link.from_node.type != "HUE_SAT":  # re-run safe
        src = link.from_socket
        hsv = nt.nodes.new("ShaderNodeHueSaturation")
        nt.links.new(src, hsv.inputs["Color"])
        nt.links.new(hsv.outputs["Color"], bsdf.inputs["Base Color"])
    hsv = bsdf.inputs["Base Color"].links[0].from_node
    hsv.inputs["Hue"].default_value = 0.51
    hsv.inputs["Saturation"].default_value = 0.8
    hsv.inputs["Value"].default_value = 0.65

# --- forest floor: Ground037 moss, rocky_gravel as needle litter, mixed by a large noise -----
mat = bpy.data.materials["ForestFloor"]
nodes, links, bsdf = fresh(mat)
uv = nodes.new("ShaderNodeTexCoord")
obj = uv.outputs["Object"]


def uv_scaled(tile_m):
    m = nodes.new("ShaderNodeMapping")
    m.inputs["Scale"].default_value = (90 / tile_m, 90 / tile_m, 1)  # ground is 90 m across, UV 0-1
    links.new(uv.outputs["UV"], m.inputs["Vector"])
    return m.outputs["Vector"]


moss_v, litter_v = uv_scaled(2.2), uv_scaled(1.6)
moss = tex(nodes, links, moss_v, img(f"{GAME_TEX}/ground037_alb_ht.dds", True))
moss_nr = tex(nodes, links, moss_v, img(f"{GAME_TEX}/ground037_nrm_rgh.png", False))
litter = tex(nodes, links, litter_v, img(f"{TEX}/rocky_gravel_diff_2k.jpg", True))
litter_arm = tex(nodes, links, litter_v, img(f"{TEX}/rocky_gravel_arm_2k.jpg", False))
litter_h = tex(nodes, links, litter_v, img(f"{TEX}/rocky_gravel_disp_2k.png", False))

litter_hsv = nodes.new("ShaderNodeHueSaturation")
litter_hsv.inputs["Saturation"].default_value = 0.75
litter_hsv.inputs["Value"].default_value = 0.55
links.new(litter.outputs["Color"], litter_hsv.inputs["Color"])
moss_hsv = nodes.new("ShaderNodeHueSaturation")
moss_hsv.inputs["Value"].default_value = 0.7
links.new(moss.outputs["Color"], moss_hsv.inputs["Color"])

patches = nodes.new("ShaderNodeTexNoise")  # needle litter vs moss, patches a few metres wide
patches.inputs["Scale"].default_value = 0.25
patches.inputs["Detail"].default_value = 4
links.new(obj, patches.inputs["Vector"])
ramp = nodes.new("ShaderNodeValToRGB")
ramp.color_ramp.elements[0].position, ramp.color_ramp.elements[1].position = 0.42, 0.6
links.new(patches.outputs["Fac"], ramp.inputs["Fac"])
mask = ramp.outputs["Color"]

colour = nodes.new("ShaderNodeMix")
colour.data_type = "RGBA"
links.new(mask, colour.inputs["Factor"])
links.new(moss_hsv.outputs["Color"], colour.inputs["A"])
links.new(litter_hsv.outputs["Color"], colour.inputs["B"])

dark = nodes.new("ShaderNodeTexNoise")  # broad damp/dry variation
dark.inputs["Scale"].default_value = 0.06
links.new(obj, dark.inputs["Vector"])
dark_range = nodes.new("ShaderNodeMapRange")
dark_range.inputs["To Min"].default_value, dark_range.inputs["To Max"].default_value = 0.7, 1.0
links.new(dark.outputs["Fac"], dark_range.inputs["Value"])
shade = nodes.new("ShaderNodeMix")
shade.data_type, shade.blend_type = "RGBA", "MULTIPLY"
shade.inputs["Factor"].default_value = 1.0
links.new(colour.outputs["Result"], shade.inputs["A"])
links.new(dark_range.outputs["Result"], shade.inputs["B"])
links.new(shade.outputs["Result"], bsdf.inputs["Base Color"])

litter_sep = nodes.new("ShaderNodeSeparateColor")
links.new(litter_arm.outputs["Color"], litter_sep.inputs["Color"])
rough = nodes.new("ShaderNodeMix")
links.new(mask, rough.inputs["Factor"])
links.new(moss_nr.outputs["Alpha"], rough.inputs["A"])
links.new(litter_sep.outputs["Green"], rough.inputs["B"])
links.new(rough.outputs["Result"], bsdf.inputs["Roughness"])

normal_map = nodes.new("ShaderNodeNormalMap")
links.new(moss_nr.outputs["Color"], normal_map.inputs["Color"])
litter_bump_h = nodes.new("ShaderNodeMath")
litter_bump_h.operation = "MULTIPLY"
links.new(litter_h.outputs["Color"], litter_bump_h.inputs[0])
links.new(mask, litter_bump_h.inputs[1])
bump = nodes.new("ShaderNodeBump")
bump.inputs["Strength"].default_value = 0.6
bump.inputs["Distance"].default_value = 0.02
links.new(litter_bump_h.outputs[0], bump.inputs["Height"])
links.new(normal_map.outputs["Normal"], bump.inputs["Normal"])
links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])

# --- wendigo: grimy grade over the game textures (decision 17), damp slightly glossy skin ----
for name in ("blinn10SG.004", "blinn11SG.004"):
    nt = bpy.data.materials[name].node_tree
    nodes, links = nt.nodes, nt.links
    for n in [n for n in nodes if n.type in {"HUE_SAT", "MIX", "TEX_NOISE", "TEX_COORD"}]:
        nodes.remove(n)  # re-run safe
    b = next(n for n in nodes if n.type == "BSDF_PRINCIPLED")
    t = next(n for n in nodes if n.type == "TEX_IMAGE")
    b.inputs["Roughness"].default_value = 0.45
    hsv = nodes.new("ShaderNodeHueSaturation")  # bone to off-white, red cloth to dried blood
    hsv.inputs["Saturation"].default_value = 0.6
    hsv.inputs["Value"].default_value = 0.6
    links.new(t.outputs["Color"], hsv.inputs["Color"])
    coords = nodes.new("ShaderNodeTexCoord")
    grime_mask = nodes.new("ShaderNodeTexNoise")
    grime_mask.inputs["Scale"].default_value = 0.35  # mesh space is ~19 units tall (rig scales it to 2.7 m)
    grime_mask.inputs["Detail"].default_value = 8
    links.new(coords.outputs["Object"], grime_mask.inputs["Vector"])
    grime = nodes.new("ShaderNodeMix")
    grime.data_type, grime.blend_type = "RGBA", "MULTIPLY"
    grime.inputs["B"].default_value = (0.42, 0.33, 0.24, 1)  # earthy dirt
    links.new(grime_mask.outputs["Fac"], grime.inputs["Factor"])
    links.new(hsv.outputs["Color"], grime.inputs["A"])
    links.new(grime.outputs["Result"], b.inputs["Base Color"])

bpy.ops.wm.save_as_mainfile(filepath=f"{ROOT}/blend/stalked_v003.blend")
print("saved", bpy.data.filepath)

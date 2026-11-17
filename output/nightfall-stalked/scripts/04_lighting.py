# 04_lighting.py
# Purpose: M4 lighting & atmosphere. Cold moon behind the wendigo (so the fog behind it glows
#          and it reads as a silhouette), forest fog, a two-part flashlight (tight hotspot + wide
#          faint spill) with near-field softening, dark night sky, Cycles quality settings.
# Input:   output/nightfall-stalked/blend/stalked_v003.blend
# Output:  output/nightfall-stalked/blend/stalked_v004.blend
# Run:     blender --background --factory-startup blend/stalked_v003.blend --python 04_lighting.py
import math

import bpy

ROOT = "C:/Users/arins/Arin/School/Projects/Portfolio/output/nightfall-stalked"
# Option D "middle" (applied 2026-11-17, pending the user's confirmation; E ghost = 0.06/0.3/150,
# A clear = 0.035/0.25/300). The spill is what reaches the wendigo, so it stays dim.
FOG_DENSITY = 0.045       # 1/m; far trees fade out by ~20 m
MOON_STRENGTH = 0.2
HOT_POWER, SPILL_POWER = 900.0, 120.0
EXPOSURE = 0.0
sc = bpy.context.scene
cam = bpy.data.objects["HunterEyes"]
r = math.radians

# --- moon: from beyond the wendigo toward the hunter, 35 deg above the horizon --------------
moon = bpy.data.objects["Moon"]
moon.data.energy, moon.data.color, moon.data.angle = MOON_STRENGTH, (0.55, 0.68, 1.0), r(0.5)
moon.rotation_euler = (r(55), 0, r(132))

# --- night sky seen through the canopy ------------------------------------------------------
bg = next(n for n in sc.world.node_tree.nodes if n.type == "BACKGROUND")
bg.inputs[0].default_value = (0.004, 0.006, 0.012, 1)
bg.inputs[1].default_value = 1.0

# --- fog: one box around the whole forest (the camera sits inside it) -----------------------
fog = bpy.data.objects.get("Fog")
if fog is None:
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 9))
    fog = bpy.context.active_object
    fog.name = fog.data.name = "Fog"
    fog.scale = (72, 72, 20)
    fog.display_type = "BOUNDS"
    fog.hide_select = True
fog_mat = bpy.data.materials.get("Fog") or bpy.data.materials.new("Fog")
fog_mat.use_nodes = True
nodes, links = fog_mat.node_tree.nodes, fog_mat.node_tree.links
nodes.clear()
vol = nodes.new("ShaderNodeVolumePrincipled")
out = nodes.new("ShaderNodeOutputMaterial")
links.new(vol.outputs["Volume"], out.inputs["Volume"])
vol.inputs["Color"].default_value = (0.78, 0.82, 0.9, 1)
vol.inputs["Density"].default_value = FOG_DENSITY
vol.inputs["Anisotropy"].default_value = 0.45  # forward scatter: the beam and the moon-lit fog glow toward us
fog.data.materials.clear()
fog.data.materials.append(fog_mat)


# --- flashlight: tight hotspot + wide faint spill, both softened up close -------------------
def soften(light, smooth):
    """Quadratic falloff with a smooth term: trunks 3 m away don't blow out as hard."""
    light.use_nodes = True
    nt = light.node_tree
    emit = next(n for n in nt.nodes if n.type == "EMISSION")
    fall = next((n for n in nt.nodes if n.type == "LIGHT_FALLOFF"), None) or nt.nodes.new("ShaderNodeLightFalloff")
    fall.inputs["Strength"].default_value = 1.0
    fall.inputs["Smooth"].default_value = smooth
    nt.links.new(fall.outputs["Quadratic"], emit.inputs["Strength"])


hot = bpy.data.lights["Flashlight"]
hot.energy, hot.spot_size, hot.spot_blend = HOT_POWER, r(20), 0.55
hot.color = (1.0, 0.88, 0.74)  # warm LED, against the cold moon
soften(hot, 8.0)

spill_obj = bpy.data.objects.get("FlashlightSpill")
if spill_obj is None:
    spill = bpy.data.lights.new("FlashlightSpill", "SPOT")
    spill_obj = bpy.data.objects.new("FlashlightSpill", spill)
    sc.collection.objects.link(spill_obj)
    flash = bpy.data.objects["Flashlight"]
    spill_obj.parent = cam
    spill_obj.location = flash.location
    spill_obj.rotation_euler = flash.rotation_euler
spill = spill_obj.data
spill.energy, spill.spot_size, spill.spot_blend = SPILL_POWER, r(52), 1.0
spill.color, spill.shadow_soft_size = (1.0, 0.88, 0.74), 0.02
soften(spill, 8.0)

# --- colour and Cycles quality (final values; samples tuned from the timing test) -----------
sc.view_settings.view_transform = "AgX"
sc.view_settings.exposure = EXPOSURE
cy = sc.cycles
cy.device = "GPU"
cy.samples, cy.adaptive_threshold = 128, 0.03
cy.use_denoising = True
cy.max_bounces, cy.diffuse_bounces, cy.glossy_bounces = 6, 3, 2
cy.transmission_bounces, cy.volume_bounces = 2, 1
cy.transparent_max_bounces = 32  # stacked alpha needle cards
cy.caustics_reflective = cy.caustics_refractive = False
cy.blur_glossy = 1.0

bpy.ops.wm.save_as_mainfile(filepath=f"{ROOT}/blend/stalked_v004.blend")
print("saved", bpy.data.filepath)

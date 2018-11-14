import bpy, sys, json

argv = sys.argv
argv = argv[argv.index("--") + 1:]  # get all args after "--"

with open('./'+argv[1], 'r') as f:
    config = json.load(f)

    bpy.data.objects["Text"].data.body = config['text']

    activeObject = bpy.data.objects["Text"]
    mat = bpy.data.materials.new(name="Material")
    activeObject.data.materials.append(mat)
    bpy.data.objects["Text"].active_material.diffuse_color = config['color']

    scene = bpy.data.scenes["Scene"]

    camera = bpy.data.objects[config['camera']]
    scene.camera = camera

    scene.render.resolution_percentage = 25
    bpy.context.scene.render.filepath = '//'+argv[0]
    bpy.ops.render.render( write_still=True )

# blender text.blend --background --python renderText.py -- temp/foo.png huhu

# import sys


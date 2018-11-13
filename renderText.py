import bpy, sys, json

argv = sys.argv
argv = argv[argv.index("--") + 1:]  # get all args after "--"

with open('./'+argv[1], 'r') as f:
    config = json.load(f)

    bpy.data.objects["Text"].data.body = config['text']
    scene = bpy.data.scenes["Scene"]
    scene.render.resolution_percentage = 25
    bpy.context.scene.render.filepath = '//'+argv[0]
    bpy.ops.render.render( write_still=True )
    bpy.context.scene.objects.active.hide_render = True

# blender text.blend --background --python renderText.py -- temp/foo.png huhu

# import sys


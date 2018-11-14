import bpy, sys, json

argv = sys.argv
argv = argv[argv.index("--") + 1:]

with open('./'+argv[1], 'r') as f:
    config = json.load(f)

    print(config['texture'])
    print(config['texture'])
    print(config['texture'])
    print(config['texture'])
    print(config['texture'])
    bpy.data.images['image.png'].filepath = 'temp/'+config['texture']

    scene = bpy.data.scenes["Scene"]

    scene.render.resolution_percentage = 25
    bpy.context.scene.render.filepath = '//'+argv[0]
    bpy.ops.render.render( write_still=True )

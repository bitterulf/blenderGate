import bpy, sys, json

argv = sys.argv
argv = argv[argv.index("--") + 1:]  # get all args after "--"

with open('./'+argv[1], 'r') as f:
    config = json.load(f)

    nodes = bpy.context.scene.node_tree.nodes
    nodes["Texture"].inputs[1].default_value = (config["size"], config["size"], config["size"])
    bpy.context.scene.node_tree.update_tag()

    scene = bpy.data.scenes["Scene"]
    scene.render.resolution_percentage = 25
    bpy.context.scene.render.filepath = '//'+argv[0]
    bpy.ops.render.render( write_still=True )

# blender texture.blend --python renderTexture.py -- temp/f86f221c3721fc8d78764307ab2b4cc9db7fb2b9.png temp/f86f221c3721fc8d78764307ab2b4cc9db7fb2b9.json

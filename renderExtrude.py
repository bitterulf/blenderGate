import bpy, sys, json

argv = sys.argv
argv = argv[argv.index("--") + 1:]

with open('./'+argv[1], 'r') as f:
    config = json.load(f)

    scene = bpy.data.scenes["Scene"]

    bpy.ops.import_curve.svg (filepath='temp/'+config['svg'])

    bpy.ops.object.select_all(action='DESELECT')
    bpy.data.objects['Curve'].select = True
    bpy.context.scene.objects.active = bpy.data.objects['Curve']
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
    bpy.context.object.dimensions = (6, 6, 0)
    bpy.context.object.location.x = 0
    bpy.context.object.location.y = 0
    bpy.context.object.location.z = 0
    bpy.context.object.data.extrude = 0.5
    bpy.context.object.material_slots[0].material.diffuse_color = (1, 1, 1)
    bpy.context.object.material_slots[0].material.specular_color = (1, 1, 1)

    scene.render.resolution_percentage = 25
    bpy.context.scene.render.filepath = '//'+argv[0]
    bpy.ops.render.render( write_still=True )

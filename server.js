'use strict';

const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const Joi = require('joi');
const HapiSwagger = require('hapi-swagger');
const Pack = require('./package');
const FS = require('fs');
const Util = require('util');
const exec = Util.promisify(require('child_process').exec);
const readFile = Util.promisify(require('fs').readFile);
const hash = require('object-hash');
const fileHash = Util.promisify(require('md5-file'));
const pathExists = require('path-exists');
const writeFile = Util.promisify(require('fs').writeFile);
const convert = require('color-convert');
const download = require('download');

const server=Hapi.server({
    host:'localhost',
    port:8080
});

const simpleTextHandler = async function(request, h) {
    const blendFile = 'simpletext.blend';

    const config = {
        hash: await fileHash(blendFile),
        text: request.params.text
    };

    const resultId = hash(config);

    const exists = await pathExists('./temp/'+resultId+'.png');

    if (!exists) {
        await exec('blender '+blendFile+' --background --python renderSimpleText.py -- temp/'+resultId+'.png '+config.text);
    }

    const image = await readFile('./temp/'+resultId+'.png');
    const response = h.response(image);
    response.type('image/png');
    response.header('Content-Disposition', 'inline');

    return response;
}

const textHandler = async function(request, h) {
    const blendFile = 'text.blend';

    const config = {
        hash: await fileHash(blendFile),
        text: request.params.text,
        color: convert.hex.rgb('#'+request.params.color).map(function(c) { return c / 255 }),
        camera: request.params.camera
    };

    const resultId = hash(config);

    const exists = await pathExists('./temp/'+resultId+'.png');

    if (!exists) {
        await writeFile('./temp/'+resultId+'.json', JSON.stringify(config));
        const result = await exec('blender '+blendFile+' --background --python renderText.py -- temp/'+resultId+'.png temp/'+resultId+'.json');
        console.log(result);
    }

    const image = await readFile('./temp/'+resultId+'.png');
    const response = h.response(image);
    response.type('image/png');
    response.header('Content-Disposition', 'inline');

    return response;
}

const frameHandler = async function(request, h) {
    const blendFile = 'frame.blend';

    const blendHash = await fileHash(blendFile);
    const config = {
        hash: blendHash,
        texture: blendHash+'_texture1.jpg'
    };

    const textureExists = await pathExists('./temp/'+config.texture);
    if (!textureExists) {
        const texture = await download(request.query.url);
        await writeFile('./temp/'+config.texture, texture);
    }

    const resultId = hash(config);

    const exists = await pathExists('./temp/'+resultId+'.png');

    if (!exists) {
        await writeFile('./temp/'+resultId+'.json', JSON.stringify(config));
        const command = 'blender '+blendFile+' --background --python renderFrame.py -- temp/'+resultId+'.png temp/'+resultId+'.json';
        console.log(command);
        const result = await exec(command);
        console.log(result);
    }

    const image = await readFile('./temp/'+resultId+'.png');
    const response = h.response(image);
    response.type('image/png');
    response.header('Content-Disposition', 'inline');

    return response;
}

server.route({
    method:'GET',
    path:'/simpletext/{text}',
    options: {
        handler: simpleTextHandler,
        description: 'render text',
        notes: 'Returns a image of the text',
        tags: ['api'], // ADD THIS TAG
        validate: {
            params: {
                text : Joi.string()
                        .required()
                        .description('text to render'),
            }
        }
    },
});

server.route({
    method:'GET',
    path:'/text/{text}-{color}-{camera}.png',
    options: {
        handler: textHandler,
        description: 'render text',
        notes: 'Returns a image of the text',
        tags: ['api'], // ADD THIS TAG
        validate: {
            params: {
                text: Joi.string()
                    .required()
                    .description('text to render'),
                color: Joi
                    .string()
                    .valid('ff00ff', '00ff00', '808080')
                    .default('ff00ff')
                    .required(),
                camera: Joi
                    .string()
                    .valid('Camera1', 'Camera2')
                    .default('Camera1')
                    .required()
            }
        }
    }
});

server.route({
    method:'GET',
    path:'/frame',
    options: {
        handler: frameHandler,
        description: 'render text',
        notes: 'Renders a image in a frame',
        tags: ['api'],
        validate: {
            query: {
                url: Joi.string()
                    .default('https://octodex.github.com/images/privateinvestocat.jpg')
                    .required()
                    .description('image to render'),
            }
        }
    }
});

const swaggerOptions = {
    info: {
        title: 'Test API Documentation',
        version: Pack.version,
    },
};

async function start() {
    await server.register([
        Inert,
        Vision,
        {
            plugin: HapiSwagger,
            options: swaggerOptions
        }
    ]);

    try {
        await server.start();
    }
    catch (err) {
        console.log(err);
        process.exit(1);
    }

    console.log('Server running at:', server.info.uri);
};

start();

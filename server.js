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
const trace = Util.promisify(require('potrace').trace);

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

const extrudeHandler = async function(request, h) {
    const blendFile = 'extrude.blend';

    const urlHash = hash({ url: request.query.url });

    const blendHash = await fileHash(blendFile);
    const config = {
        hash: blendHash,
        svg: urlHash+'.svg'
    };

    const svgExists = await pathExists('./temp/'+config.svg);
    if (!svgExists) {
        const svg = await download(request.query.url);
        await writeFile('./temp/'+config.svg, svg);
    }

    const resultId = hash(config);

    const exists = await pathExists('./temp/'+resultId+'.png');

    if (!exists) {
        await writeFile('./temp/'+resultId+'.json', JSON.stringify(config));
        const command = 'blender '+blendFile+' --background --python renderExtrude.py -- temp/'+resultId+'.png temp/'+resultId+'.json';
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

const svgHandler = async function(request, h) {

    const urlHash = hash({ url: request.query.url });

    const config = {
        image: urlHash
    };

    const imageExists = await pathExists('./temp/'+config.image+'.svg');
    if (!imageExists) {
        const image = await download(request.query.url);
        const convertedImage = await trace(image);
        await writeFile('./temp/'+config.image+'.svg', convertedImage);
    }

    const image = await readFile('./temp/'+config.image+'.svg');
    const response = h.response(image.toString());
    response.type('image/svg+xml');

    return response;
}

const frameHandler = async function(request, h) {
    const blendFile = 'frame.blend';

    const urlHash = hash({ url: request.query.url });

    const blendHash = await fileHash(blendFile);
    const config = {
        hash: blendHash,
        texture: urlHash+'texture1.jpg'
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

const textureHandler = async function(request, h) {
    const blendFile = 'texture.blend';

    const blendHash = await fileHash(blendFile);
    const config = {
        size: request.query.size,
        hash: blendHash
    };

    const resultId = hash(config);

    const exists = await pathExists('./temp/'+resultId+'.png');

    if (!exists) {
        await writeFile('./temp/'+resultId+'.json', JSON.stringify(config));
        const command = 'blender '+blendFile+' --background --python renderTexture.py -- temp/'+resultId+'.png temp/'+resultId+'.json';
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

const solidHandler = async function(request, h) {
    const blendFile = 'solid.blend';

    const blendHash = await fileHash(blendFile);
    const config = {
        shape: request.query.shape,
        mat1: request.query.mat1,
        mat2: request.query.mat2,
        hash: blendHash
    };

    const resultId = hash(config);

    const exists = await pathExists('./temp/'+resultId+'.png');

    if (!exists) {
        await writeFile('./temp/'+resultId+'.json', JSON.stringify(config));
        const command = 'blender '+blendFile+' --background --python renderSolid.py -- temp/'+resultId+'.png temp/'+resultId+'.json';
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

const combineHandler = async function(request, h) {
    const blendFile = 'combine.blend';

    const blendHash = await fileHash(blendFile);
    const config = {
        Corner1: request.query.Corner1,
        Corner2: request.query.Corner2,
        Corner3: request.query.Corner3,
        Corner4: request.query.Corner4
    };

    const resultId = hash(config);

    const exists = await pathExists('./temp/'+resultId+'.png');

    if (!exists) {
        await writeFile('./temp/'+resultId+'.json', JSON.stringify(config));
        const command = 'blender '+blendFile+' --background --python renderCombine.py -- temp/'+resultId+'.png temp/'+resultId+'.json';
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
    path:'/frame.png',
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

server.route({
    method:'GET',
    path:'/texture.png',
    options: {
        handler: textureHandler,
        description: 'render texture',
        notes: 'Renders a texture',
        tags: ['api'],
        validate: {
            query: {
                size: Joi.number()
                    .default(1)
                    .required()
                    .description('texture scaling'),
            }
        }
    }
});

server.route({
    method:'GET',
    path:'/converted.svg',
    options: {
        handler: svgHandler,
        description: 'convert image to svg',
        notes: 'only one color',
        tags: ['api'],
        validate: {
            query: {
                url: Joi.string()
                    .default('https://octodex.github.com/images/octobiwan.jpg')
                    .required()
                    .description('image to convert'),
            }
        }
    }
});

server.route({
    method:'GET',
    path:'/extrude.png',
    options: {
        handler: extrudeHandler,
        description: 'extrude svg',
        notes: 'extrude vector image',
        tags: ['api'],
        validate: {
            query: {
                url: Joi.string()
                    .default('https://simpleicons.org/icons/github.svg')
                    .required()
                    .description('image to convert'),
            }
        }
    }
});

server.route({
    method:'GET',
    path:'/solid.png',
    options: {
        handler: solidHandler,
        description: 'solid',
        notes: 'solid',
        tags: ['api'],
        validate: {
            query: {
                shape: Joi.string()
                    .valid('Shape1', 'Shape2', 'Shape2', 'Shape3', 'Shape4', 'Shape5')
                    .default('Shape1')
                    .required()
                    .description('shape'),
                mat1: Joi.string()
                    .valid('Mat', 'DarkerMat', 'StrangeMat')
                    .default('Mat')
                    .required()
                    .description('mat1'),
                mat2: Joi.string()
                    .valid('Mat', 'DarkerMat', 'StrangeMat')
                    .default('DarkerMat')
                    .required()
                    .description('mat2'),
            }
        }
    }
});

server.route({
    method:'GET',
    path:'/combine.png',
    options: {
        handler: combineHandler,
        description: 'solid',
        notes: 'solid',
        tags: ['api'],
        validate: {
            query: {
                Corner1: Joi.string()
                    .valid('solid', 'damaged')
                    .default('solid')
                    .required()
                    .description('Corner1'),
                Corner2: Joi.string()
                    .valid('solid', 'damaged')
                    .default('solid')
                    .required()
                    .description('Corner2'),
                Corner3: Joi.string()
                    .valid('solid', 'damaged')
                    .default('solid')
                    .required()
                    .description('Corner3'),
                Corner4: Joi.string()
                    .valid('solid', 'damaged')
                    .default('solid')
                    .required()
                    .description('Corner4')
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

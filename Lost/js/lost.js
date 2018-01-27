    var clientWidth = Math.max(window.innerWidth, document.documentElement.clientWidth);
    var clientHeight = Math.max(window.innerHeight, document.documentElement.clientHeight);

    var screen_width = clientWidth*.95
    var screen_height = clientHeight*.95

    var game = new Phaser.Game(screen_width, screen_height, Phaser.CANVAS, 'game');
    var g_places = null
    var g_player = null

    var input_down = false;

    var flying_control = true

    var running_velocity = 250;
    var jumping_velocity = 500;

    var sounds = {};

    var n_tree_layers = 10;
    var layers_after = 0;

function init_sound(sound, length)
{
    if (!length)
        length = 10;
    sounds[sound] = game.add.audio(sound);
    sounds[sound].addMarker('x', 0, length);
    sounds[sound].allowMultiple = true;
}

function play_sound(sound)
{
    sounds[sound].play('x')
}

function stop_sound(sound)
{
    sounds[sound].stop('x')
}

//function movePlatform(platform)
//{
//    if (platform.y_period && platform.min_y != platform.max_y)
//    {
//        if (platform.y_dir == null)
//            platform.y_dir = 1;
//
//        total_dist = platform.max_y - platform.min_y;
//        v =  total_dist / platform.y_period
//
//        y = platform.sprite.y
//
//        mid_point = platform.min_y + total_dist / 2;
//
//        v *= (1 - Math.abs(y - mid_point)/total_dist);
//
//        if ((y >= platform.max_y && platform.y_dir == 1) ||
//            (y <= platform.min_y && platform.y_dir == -1))
//        {
//            platform.y_dir *= -1;
//            if (platform.hops)
//            {
//                platform.hops--;
//                if (platform.hops == 0)
//                {
//                    platform.y_dir = 0;
//                    platform.min_y = y;
//                    platform.max_y = y;
//                }
//            }
//        }
//
//        platform.sprite.body.velocity.y = platform.y_dir * v
//    }
//    if (platform.x_period && platform.min_x != platform.max_x)
//    {
//        if (platform.x_dir == null)
//            platform.x_dir = 1;
//
//        total_dist = platform.max_x - platform.min_x;
//        v =  total_dist / platform.x_period
//
//        x = platform.sprite.x
//
//        mid_point = platform.min_x + total_dist / 2;
//
//        v *= (1 - Math.abs(x - mid_point)/total_dist);
//
//        if ((x >= platform.max_x && platform.x_dir == 1) ||
//            (x <= platform.min_x && platform.x_dir == -1))
//        {
//            platform.x_dir *= -1;
//            if (platform.hops)
//            {
//                platform.hops--;
//                if (platform.hops == 0)
//                {
//                    platform.x_dir = 0;
//                    platform.min_x = x;
//                    platform.max_x = x;
//                }
//            }
//        }
//
//        platform.sprite.body.velocity.x = platform.x_dir * v
//    }
//
//}

function handlePlace(place_name, force)
{
    place = g_places[place_name];
    if ((
        !place.visited &&
        g_player.body.x >= place.x &&
        g_player.body.x <= place.x + place.width &&
        g_player.body.y >= place.y &&
        g_player.body.y <= place.y + place.height) || force)
    {
        place.visited = place.handle()
    }
}

function addTrees(treesLayer, platform, depth)
{
//    x = game.rnd.between(50, 150);
//    while (x < platform.width * platform_unit_length)
//    {
//        if (game.rnd.between(0, 1) > 0.5)
//            tree_type = '1';
//        else
//            tree_type = '2';
//        tree = treesLayer.create(0, 0, 'tree' + tree_type);
//        tree.anchor.set(0.5, 1);
//        depth_scale_factor = .5
//        tree.scale.setTo(depth_scale_factor + (1-depth_scale_factor)*((depth+1)/n_tree_layers) )
//        tree.x = platform.x + x;
//        tree.y = world_height - platform.y + 5;
//        if ( depth == n_tree_layers - 1)
//        {
//            roots = treesLayer.create(0, 0, 'roots');
//            roots.anchor.set(0.5, 0);
//            roots.scale.setTo(0.25 * (depth_scale_factor + (1-depth_scale_factor)*((depth+1)/n_tree_layers)))
//            roots.x = platform.x + x;
//            roots.y = world_height - platform.y + Math.max(platform.height, 2) * platform_unit_length - 10
//        }
//
//        x += game.rnd.between(200, 2000);
//    }

    tree_prob = .7

    for (var x = 0 ; x < platform.width * platform_unit_length ; x += 100)
    {
        rand = game.rnd.between(0, 100)/100;
        if (rand > tree_prob)
        {
            if (rand > tree_prob + .5*(1-tree_prob))
                tree_type = '1';
            else
                tree_type = '2';
            tree = treesLayer.create(0, 0, 'tree' + tree_type);
            tree.anchor.set(0.5, 1);
            depth_scale_factor = .5
            tree.scale.setTo(depth_scale_factor + (1-depth_scale_factor)*((depth+1)/n_tree_layers) )
            if (game.rnd.between(0, 1) == 1)
                tree.scale.x *= -1;
            tree.x = platform.x + x;
            tree.y = world_height - platform.y + 5;
            if ( depth == n_tree_layers - 1)
            {
                roots = treesLayer.create(0, 0, 'roots');
                roots.anchor.set(0.5, 0);
                roots.scale.setTo(0.25 * (depth_scale_factor + (1-depth_scale_factor)*((depth+1)/n_tree_layers)))
                roots.x = platform.x + x;
                roots.y = world_height - platform.y + Math.max(platform.height, 2) * platform_unit_length - 10
            }
        }
    }
}

var saved_platforms = {}
function savePlatform(platform, tag)
{
    if (saved_platforms[tag] == null)
        saved_platforms[tag] = []
    saved_platforms[tag].push(platform)
}

function default_land(impact_velocity, game)
{
    if (impact_velocity > 250)
        play_sound("land");
    if (impact_velocity > 700)
        play_sound("hit");

}

    var PhaserGame = function () {

        this.player = null;
        this.camera_focus = null;
        this.camera_focus_time = 300;
        this.camera_tween = null;
        this.walls = null;
        this.objects = null;
        this.my_tweens = [];
        this.place_names = [];
        this.places = {};

        this.cloudsLayer = null;

        this.facing = 'left';
        this.standingTimer = 0;
        this.lerpTimer = 0;

        this.wasStanding = false;
        this.cursors = null;

        this.render_textures = {};
        this.jump_counter = 0;
    };

    PhaserGame.prototype = {

        init: function () {

            this.game.renderer.renderSession.roundPixels = true;

            this.world.resize(world_width, world_height);

            this.physics.startSystem(Phaser.Physics.ARCADE);

//            this.physics.arcade.gravity.y = 900;
            this.physics.arcade.skipQuadTree = false;
        },

        preload: function () {
            this.load.spritesheet('dude', 'img/dude.png', 32, 48);

            this.load.image('ball', '../breakout/img/ball.png');
            this.load.spritesheet('flame', 'img/flame.png', 256, 256);

            this.load.image('tree1', 'img/tree1.png');
            this.load.image('tree2', 'img/tree2.png');
            this.load.image('cloud1', 'img/cloud1.png');
            this.load.image('cloud2', 'img/cloud2.png');
//            this.load.image('trigger', '../breakout/img/soccer-ball.png');
            for (var i = 1 ; i <= 5 ; i++)
            {
                wall_name = 'Wall ' + i;
                this.load.image(wall_name + ' NE', 'img/' + wall_name + ' NE.png');
                this.load.image(wall_name + ' NW', 'img/' + wall_name + ' NW.png');
                this.load.image(wall_name + ' SE', 'img/' + wall_name + ' SE.png');
                this.load.image(wall_name + ' SW', 'img/' + wall_name + ' SW.png');
            }

            this.load.image('Wall 1I NW', 'img/' + 'Wall 1I NW.png');
            this.load.image('Wall 1I NE', 'img/' + 'Wall 1I NE.png');
            this.load.image('Wall 2I NE', 'img/' + 'Wall 2I NE.png');
            this.load.image('Wall 2I NW', 'img/' + 'Wall 2I NW.png');

            this.load.image('roots', 'img/Roots.png');
            this.load.image('grass', 'img/Grass.png');


            this.load.audio('jump', 'audio/jump.wav');
            this.load.audio('hit', 'audio/ouch.wav');
            this.load.audio('land', 'audio/jumpland.wav');
            this.load.audio('gate', 'audio/Randomize.ogg');
            this.load.audio('machines', 'audio/machine.ogg');
        },

        my_moveTo: function(body, target, duration, delay, autostart)
        {
            if (!duration)
            {
                body.x = target.x
                body.y = target.y
                return
            }

            if (delay == null)
                delay = 0
            return this.add.tween(body).to({ x: target.x, y: target.y }, duration, null, autostart, delay)
        },

        renderWall : function (x, y, wall_name, renderTexture)
        {
            scale_factor = .25;

            bbb = this.add.image(0, 0, wall_name)
            bbb.anchor.set(0)
            bbb.scale.setTo(scale_factor)
            renderTexture.renderXY(bbb, x, y, false);
            bbb.kill()
            return
        },

        getWallName : function (i, j, wall_num) {
            if (i % 2 == 0)
                ew = 'W';
            else
                ew = 'E';
            if (j % 2 == 0)
                ns = 'N';
            else
                ns = 'S';
            wall_name = 'Wall ' + wall_num + ' ' + ns + ew;
            return wall_name
        },

        createRenderTexture : function (width, height)
        {
            key = width + "x" + height
            if (!(key in this.render_textures))
            {
                if (width < 2)
                {
                    console.log("Invalid width " + width)
                    width = 2;
                }
                if (width != Math.floor(width))
                {
                    console.log("Invalid width " + width)
                    width = Math.floor(width)+1;
                }
                if (height < 2)
                {
                    console.log("Invalid height " + height)
                    height = 2;
                }
                if (height != Math.floor(height))
                {
                    console.log("Invalid height " + height)
                    height = Math.floor(height);
                }

                renderTexture = game.add.renderTexture((width+.5) * platform_unit_length-15, (height+.5) * platform_unit_length-15);

                var i = 0;
                var j = 0;

                this.renderWall(i * 32, j * 32, this.getWallName(i, j, 1), renderTexture)
                for (i++ ; i < width-1 ; i++)
                    this.renderWall(i * 32, j * 32, this.getWallName(i, j, 2), renderTexture)

                this.renderWall(i * 32, j * 32, this.getWallName(1, 0, 1), renderTexture)

                for (var j = 1 ; j < height-1 ; j++)
                {
                    i = 0;
                    this.renderWall(i * 32, j * 32, this.getWallName(i, j, 3), renderTexture)
                    for (i++ ; i < width-1 ; i++)
                        this.renderWall(i * 32, j * 32, this.getWallName(i, j, 4), renderTexture)

                    this.renderWall(i * 32, j * 32, this.getWallName(1, 0, 3), renderTexture)
                }

                i = 0;
                this.renderWall(i * 32, j * 32, this.getWallName(i, 1, 1), renderTexture)
                for (i++ ; i < width-1 ; i++)
                    this.renderWall(i * 32, j * 32, this.getWallName(i, 1, 2), renderTexture)

                this.renderWall(i * 32, j * 32, this.getWallName(1, 1, 1), renderTexture)

                this.render_textures[key] = renderTexture;
            }
            return this.render_textures[key];
        },


        createPlatformSprite : function (x, y, width, height, platform)
        {
            renderTexture = this.createRenderTexture(width, height)
            platform.sprite = game.add.sprite(x, y, renderTexture);
            game.physics.arcade.enable(platform.sprite);
            platform.sprite.enableBody = true;
            platform.sprite.body.allowGravity = false;
            platform.sprite.body.immovable = true;
//            platform.sprite.body.friction = 1;
            platform.sprite.platform = platform
            this.walls.addChild(platform.sprite);
        },

        createPlatform: function (pd)
        {
            var platform = pd;
            platform.y = world_height - pd.y
            if (pd.other_y != null)
                platform.other_y = world_height - pd.other_y


            this.createPlatformSprite(platform.x, platform.y, platform.width, platform.height, platform);
            if (!platform.land)
                platform.land = default_land;

            if (platform.x_period)
            {
//                c = platform.other_x - platform.x
//                b = 2*Math.PI / d
//                a = b * c / 2
//                peak_v = a
                d = platform.x_period / 1000
                peak_v = (Math.PI / d) * (platform.other_x - platform.x)
                platform.x_tween = this.add.tween(platform.sprite.body.velocity)
                    .to({x:peak_v}, 1000*d/4, Phaser.Easing.Sinusoidal.Out)
                    .to({x:0}, 1000*d/4, Phaser.Easing.Sinusoidal.In)
                    .to({x:-peak_v}, 1000*d/4, Phaser.Easing.Sinusoidal.Out)
                    .to({x:0}, 1000*d/4, Phaser.Easing.Sinusoidal.In)
                platform.x_tween.repeatAll(-1)
                this.my_tweens.push(platform.x_tween)
            }

            if (platform.y_period)
            {
//                c = platform.other_y - platform.y
//                b = 2*Math.PI / d
//                a = b * c / 2
//                peak_v = a
                d = platform.y_period / 1000
                peak_v = (Math.PI / d) * (platform.other_y - platform.y)
                platform.y_tween = this.add.tween(platform.sprite.body.velocity)
                    .to({y:peak_v}, 1000*d/4, Phaser.Easing.Sinusoidal.Out)
                    .to({y:0}, 1000*d/4, Phaser.Easing.Sinusoidal.In)
                    .to({y:-peak_v}, 1000*d/4, Phaser.Easing.Sinusoidal.Out)
                    .to({y:0}, 1000*d/4, Phaser.Easing.Sinusoidal.In)
                platform.y_tween.repeatAll(-1)
                this.my_tweens.push(platform.y_tween)
            }

            return platform
        },


        createObject: function (name)
        {
            sprite = game.add.sprite(0, 0, name, null, this.objects);
            sprite.body.allowGravity = false;

            return sprite
        },

        addGrass : function(layer, platform)
        {
            x = this.rnd.between(50, 150);
            while (x < platform.width * platform_unit_length - 50)
            {
                grass = this.createObject('grass');
                grass.anchor.set(0.5, 1);
                grass.scale.setTo(0.25, -0.25)
                grass.x = platform.x + x;
                grass.y = platform.y + 10;

                x += this.rnd.between(100, 500);
            }
        },


        createStage: function (platform_data, places_data)
        {
            for (var i = 0 ; i < platform_data.length ; i++)
            {
                if (platform_data[i].trees)
                {
                    for (var j = 0 ; j < n_tree_layers ; j++)
                    {
                        addTrees(this.treeLayers[j], platform_data[i], j)
                    }

                    this.addGrass(this.walls, platform_data[i])
                }
            }

            for (var i = 0 ; i < platform_data.length ; i++)
            {
                var pd = platform_data[i]
                platform = this.createPlatform(pd)
                if (pd.tags)
                    pd.tags.forEach( function(tag) { savePlatform(platform, tag) })

            }

            for (var i = 0 ; i < places_data.length ; i++)
            {
                var pd = places_data[i];

                this.createPlace({
                     name: pd.name,
                     x: pd.x,
                     y: world_height - pd.y,
                     width: pd.width,
                     height: pd.height,
                     handle: pd.handle
                 })
            }

        },
        createPlace: function (place)
        {
            place.visited = false;
            this.places[place.name] = place;
            this.place_names.push(place.name);
        },

//        setLerp : function (lerp)
//        {
//            game.camera.lerp.y = lerp;
//            this.lerpBase = lerp
//            this.lerpTimer = this.time.time
//        },
//
        reveal: function (height, delay)
        {
            this.add.tween(this.camera.bounds).to({ height: height}, delay).start()
        },

        detachCameraFocus : function()
        {
            if (this.camera_tween)
            {
                this.camera_tween.stop();
                this.camera_tween = null;
            }
        },

        attachCameraFocus : function()
        {
            this.detachCameraFocus()
            this.startCameraTween();
        },


        create: function () {

            this.cloudsLayer = this.game.add.physicsGroup();

            var x = -160;

            while (x < world_width)
            {
                if (Math.random() > 0.5)
                    cloud_type = '1';
                else
                    cloud_type = '2';

                var cloud = this.cloudsLayer.create(x, this.rnd.between(-50, 100), 'cloud' + cloud_type);
                cloud.body.velocity.x = this.rnd.between(0, 10);
//                cloud.body.velocity.x = this.rnd.between(50, 60);
                cloud.scale.setTo(this.rnd.between(0.5, 2.0))

                x += this.rnd.between(100, 300);
            }

            this.cloudsLayer.setAll('body.allowGravity', false);
            this.cloudsLayer.setAll('body.immovable', true);

            this.treeLayers = [];
            for (var i = 0 ; i < n_tree_layers-layers_after ; i++)
                this.treeLayers.push(game.add.group());

            this.walls = this.add.physicsGroup();
            this.objects = this.add.physicsGroup(Phaser.Physics.ARCADE);
            this.objects.position.setTo(0, 0);

            for (; i < n_tree_layers; i++)
                this.treeLayers.push(game.add.group());

            this.player = this.add.sprite(0, 0, 'dude', null, this.objects);
            this.camera_focus = this.add.sprite(0, 0, 'ball');
            this.camera_focus.renderable = false;
            g_player = this.player;

            g_places = this.places

            this.physics.arcade.enable(this.player);
            this.physics.arcade.enable(this.camera_focus);

            this.camera_focus.body.allowGravity = false;
            this.player.body.collideWorldBounds = true;
            this.player.body.setSize(20, 32, 5, 16);

            this.player.animations.add('left', [0, 1, 2, 3], 10, true);
            this.player.animations.add('turn', [4], 20, true);
            this.player.animations.add('right', [5, 6, 7, 8], 10, true);

            this.camera.follow(this.camera_focus);

            this.cursors = this.input.keyboard.createCursorKeys();
            this.jump_key = this.input.keyboard.addKey("J".charCodeAt(0))
            this.shift_key = this.input.keyboard.addKey(16)

            this.game.input.onDown.add(function () { this.input_down=true;});
            this.game.input.onUp.add(function () { this.input_down=false;});


            sounds.hit = game.add.audio('hit');
//            sounds.hit.allowMultiple = true;
            sounds.hit.addMarker('x', 0.25, .5);

            init_sound('jump')
            init_sound('land')
            init_sound('gate');
            init_sound('machines', 3)

            init_game_data(this)


            this.camera_focus.body.x = this.player.x
            this.camera_focus.body.y = this.player.y
            this.attachCameraFocus()
            this.my_tweens.forEach(function (t) {t.start()})
        },

        wrapCloud: function (cloud)
        {
            if (cloud.body.velocity.x < 0 && cloud.x <= -160)
            {
                cloud.x = world_width;
            }
            else if (cloud.body.velocity.x > 0 && cloud.x >= world_width)
            {
                cloud.x = -cloud.width;
            }

        },

        checkCollideWall: function (player, wall) {
            if (wall.body.allowGravity)
                return false;

            return true;
        },

        collideWall: function (player, wall) {
            if (player.body.touching.up || player.body.blocked.up)
            {
                stop_sound("jump")
                play_sound("hit")
            }
            if (player.body.touching.down || player.body.blocked.down)
            {
                stop_sound("jump")
                if (!this.wasStanding)
                {
                    wall.platform.land(this.player_prev_velocity_y, this);
                }
            }
            if (wall.body.y < player.body.y && player.body.touching.down && wall.body.velocity.y > 0)
                wall.platform.sprite.body.y = wall.platform.sprite.body.prev.y-1;

        },

        overlapObject: function (player, object) {
            object.body.enable = false;

            this.add.tween(object).to({
                y : object.y - 50
            }, 1000, "Expo.easeOut", true);

            this.add.tween(object.scale).to({
                x : 2,
                y : 2
            }, 1000, "Linear", true);

            this.add.tween(object).to({
                alpha : 0.2
            }, 1000, "Linear", true).onComplete.add(object.kill, object);

            if (object.action)
                object.action(this)
        },

        startCameraTween : function()
        {
            this.camera_tween = this.my_moveTo(this.camera_focus.body, this.player, this.camera_focus_time, 0, true)
            this.camera_tween.onComplete.add(this.startCameraTween, this)
        },

        update: function () {
            this.cloudsLayer.y = Math.min(this.camera.y * .9, 1000-this.camera.view.height);
            this.cloudsLayer.x = this.camera.x * .9;
            this.cloudsLayer.forEach(this.wrapCloud, this);

            for (var i = 0 ; i < n_tree_layers ; i++)
                this.treeLayers[i].x = this.camera.x * Math.pow(.9, i+2)

            this.player_prev_velocity_y = this.player.body.velocity.y
            this.physics.arcade.collide(this.player, this.walls, this.collideWall, this.checkCollideWall, this);
	        this.physics.arcade.overlap(this.player, this.objects, this.overlapObject, null, this);

            //  Do this AFTER the collide check, or we won't have blocked/touching set
            var standing = this.player.body.blocked.down || this.player.body.touching.down;

            this.place_names.forEach(function (place_name) {handlePlace(place_name, false)});

//            if (this.camera.lerp.y < 1)
//            {
//                progress = Math.min((this.time.time - this.lerpTimer) / 6000, 1)
//                this.camera.lerp.y = this.lerpBase + progress * (1 - this.lerpBase)
//            }
//
//            if (this.revealSource && this.camera.bounds.height != this.revealTarget)
//            {
//                progress = Math.min((this.time.time - this.revealStartTime) / this.revealDuration, 1)
//                this.camera.bounds.height = progress * this.revealTarget + (1 - progress) * this.revealSource
//            }

            jumping = false;
            moving_left = false;
            moving_right = false;

            if (input_down)
            {
                x_padding = 10
                y_limit = 40
                if (this.player.body.y - game.input.worldY < y_limit)
                {
                    if (game.input.worldX < this.player.body.x - x_padding)
                    {
                        moving_left = true;
                    }
                    else if (game.input.worldX > this.player.body.x + x_padding)
                    {
                        moving_right = true;
                    }
                }
                if ((Math.abs(this.player.body.y - game.input.worldY - 2.5*y_limit) < 2*y_limit) &&
                    Math.abs(game.input.worldX - this.player.body.x) < screen_width/3)
                {
                    jumping = true;
                }
            }
            else
            {
                if (this.cursors.left.isDown)
                    moving_left = true;
                else if (this.cursors.right.isDown)
                    moving_right = true;
                if (this.cursors.up.isDown)
                    jumping = true;
            }


            if (moving_left || moving_right || jumping || !standing)
            {
                this.standingTimer = 0;
//                this.drift_wall = null;
            }
            else if (standing)
            {
                if (this.standingTimer == 0)
                    this.standingTimer = this.time.time + 500
                else if (this.standingTimer < this.time.time)
                {
                    this.player.frame = 4;
                    this.standingTimer = 0;
                }
            }

            if ((standing || flying_control) && moving_left)
            {
                this.player.body.velocity.x = -running_velocity;

                if (this.shift_key.isDown)
                    this.player.body.velocity.x = -2*running_velocity;
                if (this.facing !== 'left')
                {
                    this.player.play('left');
                    this.facing = 'left';
                }
            }
            else if ((standing || flying_control) && moving_right)
            {
                this.player.body.velocity.x = running_velocity;

                if (this.shift_key.isDown)
                    this.player.body.velocity.x = 2*running_velocity;

                if (this.facing !== 'right')
                {
                    this.player.play('right');
                    this.facing = 'right';
                }
            }
            else
            {
                if (standing || flying_control)
                    this.player.body.velocity.x = 0;

                if (this.facing !== 'idle')
                {
                    this.player.animations.stop();

                    if (this.facing === 'left')
                    {
                        this.player.frame = 0;
                    }
                    else
                    {
                        this.player.frame = 5;
                    }

                    this.facing = 'idle';
                }
            }

            //  No longer standing on the edge, but were
            //  Give them a 250ms grace period to jump after falling
//            if (!standing && this.wasStanding)
//            {
//                this.edgeTimer = this.time.time + 250;
//            }

            //  Allowed to jump?
            if ((standing /*|| this.time.time <= this.edgeTimer*/) && jumping /*&& this.time.time > this.jumpTimer*/)
            {
                if (this.jump_counter)
                {
                    this.jump_counter--;
                    play_sound('jump');
                }

                this.player.body.velocity.y = -jumping_velocity;
                if (this.shift_key.isDown)
                    this.player.body.velocity.y = -2*jumping_velocity;
//                this.jumpTimer = this.time.time + 750;
            }

            this.wasStanding = standing;
        }

    };

    game.state.add('Game', PhaserGame, true);

var platform_unit_length = 32

var world_width = 3500;
var world_height = 2000;

var stage1_height = 1000;

var hole_x = world_width - 1500;

var trigger_loc;

var pyramid_activated;

var cheats_enabled = false;
//cheats_enabled = true;

function make_pyramid(base_x, base_y, base_z, floors, bottom_width, top_width, floor_height, floor_spacing, tags) {
    var output = []
    width_increment = (bottom_width - top_width) / (floors - 1)
    platform_unit_width = 32

    for (var i = 0; i < floors; i++) {
        pd = {
            x: base_x + i * width_increment / 2 * platform_unit_width,
            y: base_y + i * floor_spacing,
            z: base_z - i,
            width: bottom_width - i * width_increment,
            height: floor_height
        }
        if (tags)
            pd.tags = tags;
        output.push(pd)
    }
    return output
}

function shift_and_sort_platforms(platforms, stage_height) {
    for (var i = 0; i < platforms.length; i++) {
        p = platforms[i]
        p.y += stage_height;
        if (p.other_y != null)
            p.other_y += stage_height;
    }

    platforms.sort(function(a, b) {
        if (a.z != null)
            a_z = a.z;
        else
            a_z = 100;
        if (b.z != null)
            b_z = b.z;
        else
            b_z = 100;

        return a_z - b_z
    })

    return platforms;
}

var gate_platform;

function bouncy_platform(x, y, bounciness)
{
    return {
           x: x,
           y: y,
           land: function(impact_velocity, game)
           {
                default_land(impact_velocity, game);
//                if (impact_velocity > 100 && !this.hops)
//                {
//                    this.max_y += bounce_size;
//                    this.y_dir = 1;
//                    this.hops = 2;
//                }
                if (!this.in_bounce)
                {
                    this.in_bounce = true;
                    this.sprite.body.velocity.y = impact_velocity * bounciness
                    tween1 = game.add.tween(this.sprite.body.velocity)
                    .to({y:0}, 1000)
                    .to({y:-this.sprite.body.velocity.y}, 1000/2)
                    .to({y:0}, 1000/2).start()
                    tween1.onComplete.add(function() {this.in_bounce=false;}, this)
//                    bounce_size = impact_velocity * bounciness
//                    tween1 = game.add.tween(this.sprite.body).to({ y: this.sprite.body.y + bounce_size},
//                        bounce_size * 7, Phaser.Easing.Quadratic.Out)
//                    tween2 = game.add.tween(this.sprite.body).to({ y: this.sprite.body.y},
//                        bounce_size * 10, Phaser.Easing.Quadratic.In)
//                    tween2.onComplete.add(function() {this.in_bounce=false;}, this)
//                    tween1.chain(tween2);
//                    tween1.start();
                }
           }
       }
}

function sinking_platform(x, y, max_sink)
{
    return {
           x: x,
           y: y,
           land: function(impact_velocity, game)
           {
                if (!this.base_y)
                    this.base_y = this.sprite.body.y;
                default_land(impact_velocity, game);
                if (impact_velocity < 250)
                    return;
                max_y = this.base_y + max_sink;
                sinkiness = .08
                sink_size = Math.min(impact_velocity * sinkiness, max_y - this.sprite.body.y);
                target_y =  this.sprite.body.y + sink_size;
                if (this.tween1)
                {
                    this.tween1.stop();
                    this.tween2.stop();
                }
                this.tween1 = game.add.tween(this.sprite).to({ y: target_y},
                    sink_size * 20, Phaser.Easing.Quadratic.Out);
                this.tween2 = game.add.tween(this.sprite).to({ y: this.base_y},
                    Math.abs(target_y-this.base_y) * 30, Phaser.Easing.Quadratic.Out);
                this.tween1.chain(this.tween2);
                this.tween1.start();
           }
       }
}

function randomTrees(max_x)
{
    tree_prob = .7
    distance = 100

    var trees = []

    for (var x = 0 ; x < max_x ; x += distance)
    {
        rand = game.rnd.between(0, 100)/100;
        if (rand > tree_prob)
        {
            if (rand > tree_prob + .5*(1-tree_prob))
                tree_type = '1';
            else
                tree_type = '2';

            flip_x = game.rnd.between(0, 1) == 1
            trees.push(
            {
                tree_type: tree_type,
                flip_x: flip_x,
                x: x,
            }
            )
        }
    }

    return trees
}

var fixedTrees =
[
    [
      {
        "tree_type": "2",
        "flip_x": false,
        "x": 250
      },
      {
        "tree_type": "2",
        "flip_x": false,
        "x": 650
      },
      {
        "tree_type": "1",
        "flip_x": false,
        "x": 750
      },
      {
        "tree_type": "2",
        "flip_x": false,
        "x": 900
      },
      {
        "tree_type": "1",
        "flip_x": true,
        "x": 1300
      },
    ],


    [
      {
        "tree_type": "2",
        "flip_x": false,
        "x": 100
      },
      {
        "tree_type": "1",
        "flip_x": true,
        "x": 300
      },
      {
        "tree_type": "1",
        "flip_x": true,
        "x": 900
      },
      {
        "tree_type": "2",
        "flip_x": false,
        "x": 1300
      }
    ]
]

function floor_trees(max_x, platform_num)
{
    var trees = []
    for (var j = 0 ; j < n_tree_layers-1 ; j++)
    {
        treesData = randomTrees(max_x)

        trees.push(treesData)
    }

    trees.push(fixedTrees[platform_num])
    return trees
}

function stage1_platform_data() {
    var platforms = []

    ground_height = 20;

    floor1 =
        {
            x: -5,
            y: ground_height,
            width: Math.floor((hole_x + 5) / platform_unit_length - 1)+1,
            height: 2,
        }
    floor1.trees = floor_trees(floor1.width * platform_unit_length, 0)

    platforms.push(floor1);

    floor2 =
        {
            x: hole_x + platform_unit_length,
            y: ground_height,
            width: Math.floor((world_width - hole_x - platform_unit_length) / platform_unit_length)+1,
            height: 2,
        }

    floor2.trees = floor_trees(floor2.width * platform_unit_length, 1)

    platforms.push(floor2)

    platforms.push({
        x: -5,
        y: ground_height + 30 * platform_unit_length - 20,
        z: 1,
        width: 2,
        height: 31,
        tags: ["stage1_tag"]
    })

    for (var i = 0 ; i < 2 ; i++)
    {
        platforms.push({
            x: -40,
            y: ground_height + 30 + 5 * (i+1) * platform_unit_length,
            z: 0,
            width: 3,
            height: 2,
            tags: ["steps_tag", "fall_tag"]
        })
    }

    top_step = {
       x: 100,
       y: ground_height + 30 + 5 * (i+1) * platform_unit_length,
       z: 101,
       width: 3,
       height: 2,
       tags: ["top_step"]
   }

    platforms.push(top_step)

    trigger_loc = {x: top_step.x + 25, y: stage1_height + top_step.y + 1.5 * platform_unit_length};

    platforms.push({
        x: world_width - 32,
        y: ground_height + 32 * platform_unit_length,
        z: 0,
        width: 2,
        height: 31,
        tags: ["stage1_tag"]
    })

    pyramid_spacing = 40
    pyramid_data = make_pyramid(world_width - 1000, ground_height + pyramid_spacing, 99, 2, 4, 2, 2, pyramid_spacing, []);
    platforms = platforms.concat(pyramid_data)

    pyramid_data = make_pyramid(hole_x - 4.7 * platform_unit_length, ground_height + pyramid_spacing, 99, 3, 10, 4, 2, pyramid_spacing, ["pyramid_tag"]);
    platforms = platforms.concat(pyramid_data)

    pyramid_data = make_pyramid(world_width - 2000, ground_height + pyramid_spacing, 99, 2, 4, 2, 2, pyramid_spacing, []);
    platforms = platforms.concat(pyramid_data)

//    pyramid_data = make_pyramid(300, ground_height + pyramid_spacing, 99, 2, 4, 2, 2, pyramid_spacing, []);
//    platforms = platforms.concat(pyramid_data)

    platforms.push({
           x: 500,
           y: 6 * 32,
           other_y: 12 * 32,
           y_period: 3000,
           width: 10,
           height: 3,
           tags: ["fall_tag"]
       })

    for (var i = 0 ; i < 3 ; ++i)
    {
        platform = bouncy_platform(1000 + i * 200, 150 + 5 * 32 + i * 75, .3)
        platform.width = 3;
        platform.height = 6;
        platform.tags = ["fall_tag"];
        platforms.push(platform);
    }

    platforms.push({
            x: 1600,
            y: 150 + 100 + 150 + 5 * 32,
            other_y: 200 + 150 + 100 + 150 + 5 * 32,
            y_period: 3000,
            width: 3,
            height: 6,
            tags: ["fall_tag"]
        })

    platform = {
           x: 1800,
           other_x: 2000,
           x_period: 2500,
           y: 200 + 150 + 100 + 150 + 5 * 32,
           width: 10,
           height: 2,
           tags: ["fall_tag"]
       }

    platforms.push(platform)
    platform = {
           x: platform.other_x + (platform.width-1) * platform_unit_length + 200 + 4,
           other_x: platform.other_x + (platform.width) * platform_unit_length,
           x_period: platform.x_period,
           y: platform.y,
           width: 5,
           height: platform.height,
           tags: platform.tags
       }

    platforms.push(platform)

    gate_roof_y = 150 + 100 + 5 * 32 + 4 * platform_unit_length + 10
    platform = {
        x: 2525,
        y: gate_roof_y,
        width: 2,
        height: 6,
        tags: ["fall_tag"]}
    platforms.push(platform);

    gate_platform = {
        x: platform.x + 2 * platform_unit_length - 5,
        y: gate_roof_y - (4 * platform_unit_length),
        width: 4,
        height: 2,
        tags: ["fall_tag", "gate_platform"]
    }

    platforms.push(gate_platform)
    platform = {
        x: gate_platform.x,
        y: gate_roof_y,
        width: gate_platform.width,
        height: 2,
        tags: ["fall_tag"]
    }
    platforms.push(platform);

    platform = sinking_platform(gate_platform.x+gate_platform.width*platform_unit_length-5,
                    gate_roof_y, 5 * platform_unit_length)
    platform.width = 2;
    platform.height = 6;
    platform.tags = ["fall_tag"];
    platforms.push(platform);

    platforms = platforms.concat(stage2_early_platform_data())

    return shift_and_sort_platforms(platforms, stage1_height)
}

function make_gate_td() {
    var gate_td = [{
        x: 0,
        y: 4,
        name: 'Wall 1I NW'
    }, {
        x: 1,
        y: 4,
        name: 'Wall 2I NE'
    }, {
        x: 2,
        y: 4,
        name: 'Wall 2I NW'
    }, {
        x: 3,
        y: 4,
        name: 'Wall 2I NE'
    }, {
        x: 4,
        y: 4,
        name: 'Wall 2I NW'
    }, {
        x: 5,
        y: 4,
        name: 'Wall 1I NE'
    },
    {
        x: 0,
        y: 3,
        name: 'Wall 1 SW'
    }, {
        x: 1,
        y: 3,
        name: 'Wall 5 SE'
    }, {
        x: 2,
        y: 3,
        name: 'Wall 2 SW'
    }, {
        x: 3,
        y: 3,
        name: 'Wall 2 SE'
    }, {
        x: 4,
        y: 3,
        name: 'Wall 5 SW'
    }, {
        x: 5,
        y: 3,
        name: 'Wall 1 SE'
    },
    {
        x: 1,
        y: 2,
        name: 'Wall 3 NE'
    }, {
        x: 4,
        y: 2,
        name: 'Wall 3 NW'
    },
    {
        x: 1,
        y: 1,
        name: 'Wall 3 SE'
    }, {
        x: 4,
        y: 1,
        name: 'Wall 3 SW'
    },
    {
        x: 1,
        y: 0,
        name: 'Wall 5 NE'
    }, {
        x: 4,
        y: 0,
        name: 'Wall 5 NW'
    }, ]

    for (var i = 0; i < gate_td.length; i++) {
        var td = gate_td[i]
        td.scale = {
            x: .5,
            y: .75
        };
        td.x *= 32 * td.scale.x;
        td.x += gate_platform.x + (gate_platform.width * 32 / 2) - (6 * 32 * td.scale.x / 2);

        td.y *= 32 * td.scale.y;
        td.y += gate_platform.y;
        if (i < 6) {
            td.y -= 32 * td.scale.y;
            td.scale.y *= .2
            td.y += 32 * td.scale.y;
        }
    }
    return gate_td
}

function do_steps(game) {
    platforms = saved_platforms["steps_tag"]

    game.detachCameraFocus();
    game.my_moveTo(game.camera_focus.body, platforms[1].sprite, 1000, 0, true)

    for (var i = 0; i < platforms.length; i++)
    {
        target = platforms[i].sprite
        platform_tween = game.add.tween(target).to({ x: target.body.x + 80}, 3000).start()
    }

//    camera_return_tween = game.my_moveTo(game.camera_focus.body, game.player, 1000, 500, false)
    camera_return_tween = game.add.tween(this).to({dummy: 0}, 0, null, false, 500)

    camera_return_tween.onComplete.add(game.attachCameraFocus, game)

    platform_tween.chain(camera_return_tween)

    platform = saved_platforms["gate_platform"][0]
    target = platform.sprite
    game.add.tween(target).to({ x: target.body.x + platform_unit_length}, 3000, null, true, 10000)

    play_sound('machines')

    game.player.body.gravity.y = -150;

    return true;
}

function do_pyramid(game) {
    stop_sound("hit")
    stop_sound("land")
    play_sound('machines');

    pyramid_platforms = saved_platforms["pyramid_tag"]

    game.detachCameraFocus();
    game.my_moveTo(game.camera_focus.body, pyramid_platforms[0].sprite, 1000, 0, true)


    for (var i = 0; i < pyramid_platforms.length; i++)
    {
        target = pyramid_platforms[i].sprite
        platform_tween = game.add.tween(target).to({ y: target.body.y - 60}, 3000).start()
    }

    platform_tween.onComplete.add(function () {do_fall(game)} )

    pyramid_activated = true;
    return true
}

function do_fall(game)
{
    fall_platforms = saved_platforms["fall_tag"]
    for (var i = 0; i < fall_platforms.length; i++) {
        pl = fall_platforms[i]
        if (pl.x_tween)
            pl.x_tween.stop()
        if (pl.y_tween)
            pl.y_tween.stop()

        pl.sprite.body.allowGravity = true;
    }

    play_sound('gate');

    camera_return_tween = game.my_moveTo(game.camera_focus.body, game.player, 1000, 500, true)
//    camera_return_tween = game.add.tween(this).to({dummy: 0}, 0, null, true, 100)
    camera_return_tween.onComplete.add(game.attachCameraFocus, game)

    game.player.body.gravity.y = 0;

    platform = saved_platforms["top_step"][0]
    target = platform.sprite.body
    platform_tween = game.add.tween(target).to({ y: world_height-(stage1_height+ground_height)}, 4*1000)
    camera_return_tween.chain(platform_tween)

    platform_tween.onComplete.add(function () {do_flower_appear(game)});

    platform_tween2 = game.add.tween(target).to({ x: hole_x-platform_unit_length}, 4*1000)
    platform_tween.chain(platform_tween2)

}

function do_flower_appear(game)
{
    pyramid_top_platform = saved_platforms["pyramid_tag"][0].sprite.body

    flower = game.createObject('flower')
    flower.scale.setTo(.5)
    flower.anchor.setTo(.5, .9)
    flower.x = hole_x + platform_unit_length / 2
    flower.y = pyramid_top_platform.y
    flower.action = do_flower
}

function do_flower(game)
{
    play_sound('shrink');

    shrink_time = 3 * 1000
    var player_target_size = .5
    game.add.tween(game.player).to({abs_size: player_target_size}, shrink_time, Phaser.Easing.Linear.None, true)
    game.add.tween(game.player.scale).to({y: player_target_size}, shrink_time, Phaser.Easing.Linear.None, true)
}

function kill_platforms_by_tag(tag)
{
    platforms = saved_platforms[tag]
    for (var i = 0; i < platforms.length; i++)
        platforms[i].sprite.kill()
}
function stage1_places_data(game) {
    var output = []

    output.push({
        name: "teaser_stage2",
        x: 0,
        y: stage1_height + ground_height + 100,
        width: hole_x + platform_unit_length * 10,
        height: 200,
        handle: function() {
            if (!pyramid_activated)
                return false;
            game.reveal(stage1_height + 150, 5000)
            return true;

        }
    })

    output.push({
        name: "reveal_stage2",
        x: 0,
        y: stage1_height - 50,
        width: world_width,
        height: 200,
        handle: function() {
            create_and_reveal_stage2(game)
            kill_platforms_by_tag("stage1_tag")
            kill_platforms_by_tag("fall_tag")

            return true;
        }
    })

    return output;
}

function make_flame(game, x, y)
{
    sprite = game.createObject('flame')

    sprite.scale.setTo(.25)
    sprite.anchor.setTo(.25, .25)
    sprite.x = x
    sprite.y = world_height - y
    sprite.animations.add('flame', null, 20, true);
    sprite.play('flame');

    return sprite
}

function create_grasshead(game, min_x, max_x, y)
{
    sprite = game.createEnemy('grasshead')

//    sprite.scale.setTo(.125)
    sprite.anchor.setTo(0.5, .9)
    sprite.animations.add('gh', null, 40, true);
    sprite.play('gh');
    crop_x = 9
    crop_y = 5
    sprite.body.setSize(49-2*crop_x, 48-2*crop_y, crop_x, crop_y);
    sprite.x = min_x
    sprite.y = y
    sprite.min_x = min_x
    sprite.max_x = max_x
    sprite.speed = 100;
    sprite.body.immovable = true;
    sprite.update = function(game)
    {
        if (!this.dir)
        {
            this.dir = 1;
            this.body.velocity.x = this.dir * this.speed;
        }

        if (this.body.x >= this.max_x)
        {
            this.dir = -1;
            this.body.velocity.x = this.dir * this.speed;
        }
        else if (this.body.x <= this.min_x)
        {
            this.dir = 1;
            this.body.velocity.x = this.dir * this.speed;
        }

        if (this.dir == 1)
            this.scale.x = -Math.abs(this.scale.x)
        else if (this.dir == -1)
            this.scale.x = Math.abs(this.scale.x)
    }

    sprite.collidePlayer = function (player, game)
    {
        if (this.body.touching.left || this.body.touching.right)
        {
            if ((this.body.touching.left && this.dir == -1) ||
            (this.body.touching.right && this.dir == 1))
                this.body.x = this.body.prev.x
        }
    }

    return sprite
}

function create_ghost(game, min_x, max_x, y)
{
    sprite = game.createEnemy('ghost')

//    sprite.scale.setTo(.125)
    sprite.anchor.setTo(0.5, .9)
    sprite.animations.add('gh', null, 40, true);
    sprite.play('gh');
    crop_x = 9
    crop_y = 5
    sprite.body.setSize(126-2*crop_x, 82-2*crop_y, crop_x, crop_y);
    sprite.x = min_x
    sprite.y = y
    sprite.min_x = min_x
    sprite.max_x = max_x
    sprite.speed = 50;
    sprite.update = function (game)
    {
        if (!this.dir)
        {
            this.dir = 1;
            this.body.velocity.x = this.dir * this.speed;
        }

        if (this.body.x >= this.max_x)
        {
            this.dir = -1;
            this.body.velocity.x = this.dir * this.speed;
        }
        else if (this.body.x <= this.min_x)
        {
            this.dir = 1;
            this.body.velocity.x = this.dir * this.speed;
        }
    }

    sprite.collidePlayer = function (player, game)
    {
        if (this.body.touching.left || this.body.touching.right)
        {
            this.body.velocity.x = this.dir * this.speed;
//            if ((this.body.touching.left && this.dir == -1) ||
//            (this.body.touching.right && this.dir == 1))
//                this.body.x = this.body.prev.x
        }
        this.body.velocity.y = 0
        this.body.y = this.body.prev.y
    }
    return sprite
}

function init_game_data(game)
{
    game.physics.arcade.gravity.y = 900;
    game.stage.backgroundColor = '#2f9acc';

    var platform_data = stage1_platform_data()

    var places_data = stage1_places_data(game)

    flame_x = gate_platform.x + (gate_platform.width * platform_unit_length / 2) - (32 / 2);

    flame1 = make_flame(game, flame_x, gate_platform.y+44)
    flame1.action = do_steps
    flame2 = make_flame(game, trigger_loc.x, trigger_loc.y)
    flame2.action = do_pyramid

    game.createStage(platform_data, places_data)

    create_grasshead(game, 200, 440, world_height - (stage1_height + 20))

    create_ghost(game, world_width-1400, world_width-1000, world_height - (stage1_height + 800))

//    guy = game.createObject('guy')
//    guy.scale.setTo(32/78, 48/161)
//    guy.scale.setTo(.6)
//    guy.x = world_width- 500
//    guy.y = world_height - (stage1_height + ground_height + guy.height)
//    guy.animations.add('guy', null, 20, true);
//    guy.play('guy');

    game.camera.bounds.height = stage1_height;

    var stage1_start = {
        x: world_width - 300,
        y: world_height - (stage1_height + 150)
    }

    game.player.x = stage1_start.x
    game.player.y = stage1_start.y

    if (cheats_enabled)
        cheats(game)
}

function cheats(game)
{
    var stage1_gate_player_start = {
        x: world_width - 850,
        y: world_height - (stage1_height + 600)
    }
    var stage1_left_player_start = {
        x: 350,
        y: world_height - (stage1_height + 100)
    }

    var stage2_start = {
        x: world_width - 1500,
        y: world_height - stage1_height
    }


//    handlePlace("gate", true)
//    stop_sound("gate")

    game.player.x = stage1_left_player_start.x;
    game.player.y = stage1_left_player_start.y;

}

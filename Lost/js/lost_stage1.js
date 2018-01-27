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


function stage1_platform_data() {
    var platforms = []

    ground_height = 20;
    platforms.push({
        x: -5,
        y: ground_height,
        width: Math.floor((hole_x + 5) / platform_unit_length - 1)+1,
        height: 2,
        trees: true
    })
    platforms.push({
        x: hole_x + platform_unit_length,
        y: ground_height,
        width: Math.floor((world_width - hole_x - platform_unit_length) / platform_unit_length)+1,
        height: 2,
        trees: true
    })

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
        y: ground_height + 30 * 32 - 20,
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

    pyramid_data = make_pyramid(300, ground_height + pyramid_spacing, 99, 2, 4, 2, 2, pyramid_spacing, []);
    platforms = platforms.concat(pyramid_data)

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
        platform_tween = game.add.tween(target).to({ y: target.body.y - 80}, 3000).start()
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

//    camera_return_tween = game.my_moveTo(game.camera_focus.body, game.player, 1000, 500, true)
    camera_return_tween = game.add.tween(this).to({dummy: 0}, 0, null, true, 100)
    camera_return_tween.onComplete.add(game.attachCameraFocus, game)

    game.player.body.gravity.y = 0;

    platform = saved_platforms["top_step"][0]
    target = platform.sprite.body
    platform_tween = game.add.tween(target).to({ y: world_height-(stage1_height+ground_height)}, 10*500)
    camera_return_tween.chain(platform_tween)

    platform_tween2 = game.add.tween(target).to({ x: hole_x-platform_unit_length}, 7*1000)
    platform_tween.chain(platform_tween2)

//    platform_tween3 = game.add.tween(target).to({ y: world_height-(stage1_height+ground_height)}, 1*1000)
//    platform_tween2.chain(platform_tween3)
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

function make_sprite(game, x, y, name)
{
    sprite = game.createObject(name)

    sprite.scale.setTo(.25)
    sprite.anchor.setTo(.25, .25)
    sprite.x = x
    sprite.y = world_height - y
    sprite.animations.add(name, frames, 20, true);
    sprite.play(name);

    return sprite
}

function init_game_data(game)
{
    game.physics.arcade.gravity.y = 900;
    game.stage.backgroundColor = '#2f9acc';

    var platform_data = stage1_platform_data()

    var places_data = stage1_places_data(game)

    flame_x = gate_platform.x + (gate_platform.width * platform_unit_length / 2) - (32 / 2);

    flame1 = make_sprite(game, flame_x, gate_platform.y+44, 'flame')
    flame1.action = do_steps
    flame2 = make_sprite(game, trigger_loc.x, trigger_loc.y, 'flame')
    flame2.action = do_pyramid

    game.createStage(platform_data, places_data)

    game.camera.bounds.height = stage1_height;

    var stage1_start = {
        x: world_width - 400,
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

    game.player.x = flame2.x+50;
    game.player.y = flame2.y;

}

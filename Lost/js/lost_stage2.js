var stage2_width = 50 * platform_unit_length
var stage2_left = hole_x - stage2_width/2
var stage2_right = stage2_left + stage2_width

function stage2_early_platform_data() {
    var platforms = []
    platforms.push({
        x: stage2_left - platform_unit_length,
        y: -20,
        width: 2,
        height: 30,
        z: 99
    })
    platforms.push({
        x: stage2_right,
        y: -20,
        width: 2,
        height: 30,
        z: 99
    })
    return platforms
}

function create_and_reveal_stage2(game)
{
    game.createStage(make_stage2_platform_data(), [])
    game.reveal(world_height, 2000)
    game.camera.bounds.x = stage2_left - 25;
    game.camera.bounds.width = stage2_right - stage2_left + 25 + 50;

    game.stage.backgroundColor = '#f00000';
}

function make_stage2_platform_data() {
    var platforms = []

    platform_spacing = 3;
    platform = {
        x: stage2_left,
        y: stage1_height - 200,
        width: (stage2_right - stage2_left)/platform_unit_length - 5,
        height: 5
    }
    platforms.push(platform)
    platforms.push({
        x: platform.x + (platform.width + 2) * platform_unit_length,
        y: platform.y,
        width: 3,
        height: platform.height + platform_spacing + 5
    })
    platform2 = {
        x: platform.x,
        y: platform.y - (platform.height + platform_spacing) * platform_unit_length,
        width: 5,
        height: 5
    }
    platforms.push(platform2)
    platforms.push({
        x: platform2.x + (platform2.width + 2) * platform_unit_length,
        y: platform2.y,
        width: platform.width + 2 - platform2.width - 2,
        height: platform2.height
    })

    //    platforms.push({x: hole_x - 1500, y:stage1_height-200-10*platform_unit_length-100, width:stage2_width/platform_unit_length, height:10})

    return shift_and_sort_platforms(platforms, 0)

}

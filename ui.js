function show_players (players) {
    $('#tabPlayers tbody').remove();
    $('#tabPlayers').append($('<tbody>'));
    players.forEach(function (player, idx) {
        $('#tabPlayers tbody').append($('<tr>')
            .append($('<td>').text(idx + 1))
            .append($('<td>').text(player.name))
            .append($('<td>').text(player.score[0]))
            .append($('<td>').text(player.score[1]))
            .append($('<td>').text(player.score[2]))
            .append($('<td>').text(player.score[3]))
        );
    });
}

function show_matches (matches) {
    $('#tabMatches tbody').remove();
    $('#tabMatches').append($('<tbody>'));
    matches.forEach(function (match, idx) {
        $('#tabMatches tbody').append($('<tr>')
            .append($('<td>').text(match.seat))
            .append($('<td>').text(match.players[0].name))
            .append($('<td>').append($('<input>').attr({
                type: 'text',
                id: 'result_0_' + idx,
                value: match.result[0],
            })))
            .append($('<td>').append($('<input>').attr({
                type: 'text',
                id: 'result_1_' + idx,
                value: match.result[1],
            })))
            .append($('<td>').append($('<input>').attr({
                type: 'text',
                id: 'result_2_' + idx,
                value: match.result[2],
            })))
            .append($('<td>').text((match.players[1] != null)? match.players[1].name : '» bye «' ))
        );
    });
}

function update_view () {
    var maxRound = (matches.length == 0)? 0 : matches
        .map(function (match) { return match.round })
        .reduce(function (r1, r2) { return Math.max(r1, r2) });
    var round = parseInt($('#numRound').val());

    sort_players(players);
    show_players(players);

    if (round == maxRound + 1) {
        proposedMatches = find_pairings(players, round);
        show_matches(proposedMatches);
    } else {
        show_matches(matches.filter(function (match) { return match.round == round }));
    }
}

$(function () {
    $('#frmPlayer').on('submit', function () {
        players.push({
            name: $('#txtPlayer').val(),
        });
        $('#txtPlayer').val('');
        init_players(players);
        update_scores(players, matches);
        update_view();
        return false;
    });
    $('#frmMatches').on('submit', function (e) {
        e.preventDefault();

        var maxRound = (matches.length == 0)? 0 : matches
            .map(function (match) { return match.round })
            .reduce(function (r1, r2) { return Math.max(r1, r2) });
        var round = parseInt($('#numRound').val());

        if (round == maxRound + 1) {
            proposedMatches.forEach(function (match, idx) {
                match.result[0] = parseInt($('#result_0_' + idx).val());
                match.result[1] = parseInt($('#result_1_' + idx).val());
                match.result[2] = parseInt($('#result_2_' + idx).val());
                match.proposed = false;
            });
            console.log(proposedMatches);
            matches = matches.concat(proposedMatches);
        } else {
            // todo
        }
        update_scores(players, matches);
        update_view();
        return false;
    });

    $('#numRound').on('change', update_view);
    update_view();

});


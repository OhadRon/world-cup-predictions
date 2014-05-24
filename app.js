
var teams = JSON.parse(data.teams);

$('.group').each(function(){
	var groupName = $(this).attr('data-group');
	$(this).find('.title').text('Group '+groupName);
});

function populateGroups(){
	for(var i=1; i<33; i++){
		var team = teams[i];
		var newDiv = $('<div>').addClass('team');
		$('.group[data-group="'+team.group+'"]').append(newDiv);
		newDiv.text(team.name);
		newDiv.attr('data-team',i);
	}
}

function testing(){
	$('.group .team').each(function(index){		
			$(this).click();
	});
	$('.team').each(function(){
		$(this).click();
	});
}

function populateStages(){
	$('.group').each(function(){ // From groups to 16th
		var winner = $(this).find('.selected').attr('data-team');
		var runnerUp = $(this).find('.runner-up').attr('data-team');

		var winnerDestination = $(this).attr('data-winner').split('.');
		var runnerUpDestination = $(this).attr('data-runnerup').split('.');

		winnerDestination = $('[data-stage="'+winnerDestination[0]+'"] [data-id="'+winnerDestination[1]+'"]')
				.find('.team')
				.eq(0);

		runnerUpDestination = $('[data-stage="'+runnerUpDestination[0]+'"] [data-id="'+runnerUpDestination[1]+'"]')
				.find('.team')
				.eq(1);

		if(winner){
			winnerDestination.text(teams[winner].name);	
			winnerDestination.removeClass('empty');
			winnerDestination.attr('data-team', winner);
		};

		if(runnerUp){
			runnerUpDestination.text(teams[runnerUp].name);	
			runnerUpDestination.removeClass('empty');
			runnerUpDestination.attr('data-team', runnerUp);
		};

	});

	// From 16th onwards
	$('.match').each(function(){ 
		var winner = $(this).find('.selected').attr('data-team');
		var winnerDestination = $(this).attr('data-winner')
		if(winnerDestination && winner){
			winnerDestination = winnerDestination.split('.');

			winnerDestination = $('.stage[data-stage="'+winnerDestination[0]+'"] .match[data-id="'+winnerDestination[1]+'"]');

			// Make sure that team isn't already in that match
			if(winnerDestination.find('[data-team="'+winner+'"]').length < 1){ 
				winnerDestination = winnerDestination.find('.empty').eq(0);
				winnerDestination.text(teams[winner].name);	
				winnerDestination.removeClass('empty');
				winnerDestination.attr('data-team', winner);						
			}
		}

		if($(this).find('.selected').length > 0){
			var loser = $(this).find('.team:not(.selected)').attr('data-team');
			var loserDestination = $(this).attr('data-loser')
			if(loserDestination && loser){
				loserDestination = loserDestination.split('.');

				loserDestination = $('.stage[data-stage="'+loserDestination[0]+'"] .match[data-id="'+loserDestination[1]+'"]');

				// Make sure that team isn't already in that match
				if(loserDestination.find('[data-team="'+loser+'"]').length < 1){ 
					loserDestination = loserDestination.find('.empty').eq(0);
					console.log(loserDestination);
					loserDestination.text(teams[loser].name);	
					loserDestination.removeClass('empty');
					loserDestination.attr('data-team', loser);						
				}
			}

		}

	});
}

populateGroups();
// Group stage selection logic
$('.group .team').on('click', function(){
	if($(this).siblings('.selected,.runner-up').length<2){
		if($(this).siblings('.selected').length>0 ){
			$(this).addClass('runner-up');
		} else {
			$(this).addClass('selected');
		}			
	}
	populateStages();
});

// Knockout stage selection logic
$('.match .team').on('click', function(){
	if(!$(this).hasClass('empty') && $(this).siblings('.selected').length<1){
		$(this).addClass('selected');
	}
	populateStages();
});

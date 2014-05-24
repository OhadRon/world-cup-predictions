
var teams = JSON.parse(data.teams);

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
					loserDestination.text(teams[loser].name);	
					loserDestination.removeClass('empty');
					loserDestination.attr('data-team', loser);						
				}
			}
		}
	});
}

function serializeSelections(){
	var selections = {};
	$('.stage').each(function(){
		var currentStage = $(this).attr('data-stage');
		selections[currentStage] = {};
		$(this).find('.group').each(function(){
			currentGroup = $(this).attr('data-group');
			selections[currentStage][currentGroup] = {}
			selections[currentStage][currentGroup]['winner'] = $(this).find('.selected').attr('data-team');
			selections[currentStage][currentGroup]['runner-up'] = $(this).find('.runner-up').attr('data-team');
		});

		$(this).find('.match').each(function(){
			selections[currentStage][$(this).attr('data-id')] = $(this).find('.selected').attr('data-team');
		});
	});

	return selections;
}

function saveToLocalStorage(){
	var data = serializeSelections();
	localStorage.data = JSON.stringify(data);
}

// Group stage selection logic
$('.group .team').on('click', function(){
	// Check if it is already selected
	if($(this).hasClass('selected') || $(this).hasClass('runner-up')){
		$(this).removeClass('selected').removeClass('runner-up');

		$('.match').find('[data-team="'+$(this).attr('data-team')+'"]').addClass('empty').attr('data-team','').removeClass('selected').text('');
	} else if($(this).siblings('.selected,.runner-up').length<2){
		if($(this).siblings('.selected').length>0 ){
			$(this).addClass('runner-up');
		} else {
			$(this).addClass('selected');
		}			
	}
	populateStages();
	saveToLocalStorage();
});

// Knockout stage selection logic
$('.match .team').on('click', function(){
	if($(this).hasClass('selected')){
		$(this).removeClass('selected');
		var thisStage = $(this).parents('.stage').attr('data-stage');
		thisStage = parseInt(thisStage);
		laterStages = $('.stage').filter(function(){
			return parseInt($(this).attr('data-stage'))< thisStage;
		});
		laterStages.find('.match [data-team="'+$(this).attr('data-team')+'"]').addClass('empty').attr('data-team','').removeClass('selected').text('');
	} else if(!$(this).hasClass('empty') && $(this).siblings('.selected').length<1){
		$(this).addClass('selected');
	}
	populateStages();
	saveToLocalStorage();
});

$('#clearAll').on('click',function(){
	$('.stage[data-stage="groups"]').find('.selected, .runner-up').click();
});

function clearStorage(){
	localStorage.data = undefined;
}

function loadLocalStorage(data){
	data = JSON.parse(data);
	for (var group in data.groups){
		if (data.groups.hasOwnProperty(group)){
			$('[data-stage="groups"] [data-team="'+data.groups[group]['winner']+'"]').click();
			$('[data-stage="groups"] [data-team="'+data.groups[group]['runner-up']+'"]').click();
		}
	}

	function clickStage(num, callback){
		for(var match in data[num]){
			$('[data-stage="'+num+'"] [data-team="'+data[num][match]+'"]').click();
		}
	}

	clickStage(16);
	clickStage(8);
	clickStage(4);
	clickStage(3);
	clickStage(2);
};

if (!(localStorage.data == undefined)) loadLocalStorage(localStorage.data);
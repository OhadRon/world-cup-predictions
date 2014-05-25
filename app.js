
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
			winnerDestination.find('.inner').text(teams[winner].name);	
			winnerDestination.removeClass('empty');
			winnerDestination.attr('data-team', winner);
		};

		if(runnerUp){
			runnerUpDestination.find('.inner').text(teams[runnerUp].name);	
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
				winnerDestination.find('.inner').text(teams[winner].name);	
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
					loserDestination.find('.inner').text(teams[loser].name);	
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

function clearStorage(){
	localStorage.data = undefined;
}

function loadFromStorage(data){
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

// Group stage selection logic
$('.group .team').on('click', function(){
	// Check if it is already selected
	if($(this).hasClass('selected') || $(this).hasClass('runner-up')){
		$(this).removeClass('selected').removeClass('runner-up');

		$('.match').find('[data-team="'+$(this).attr('data-team')+'"]').addClass('empty').attr('data-team','').removeClass('selected').find('.inner').text('');
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
		laterStages.find('.match [data-team="'+$(this).attr('data-team')+'"]').addClass('empty').attr('data-team','').removeClass('selected').find('.inner').text('');
	} else if(!$(this).hasClass('empty') && $(this).siblings('.selected').length<1){
		$(this).addClass('selected');
	}
	populateStages();
	saveToLocalStorage();
});

$('#clearAll').on('click',function(){
	$('.stage[data-stage="groups"]').find('.selected, .runner-up').click();
});

var firebaseRoot = new Firebase('https://sizzling-fire-7955.firebaseIO.com/');
var firebaseList = firebaseRoot.child('submissionList');
var auth = new FirebaseSimpleLogin(firebaseRoot, function(error, user) {
	console.log('trying to log in');
	if(user){
		console.log('login succesful', user);
		userData = user;
		$('#submit').fadeIn();
		$('#urlresult').fadeIn();
		$('#facebook-login').text('Logged in as '+userData.displayName);		
	}
});

var userData;

$('#submit').on('click', function(){
	var submission = {
		timeStamp : new Date().getTime(),
		userGuess : JSON.stringify(serializeSelections()),
		facebookName : userData.displayName || null
	}
	var privatePart = {
		facebookId : userData.id || null,
		email : userData.thirdPartyUserData.email || null
	}

	var pushRef = firebaseList.child('public').push();
	pushRef.set(submission);
	firebaseList.child('private').child(pushRef.name()).set(privatePart);
	$('#urlresult').val(window.location.origin+window.location.pathname+'#'+pushRef.name());
});

$('#urlresult').on('focus',function(){
	$(this).select();
}).mouseup(function(e) { return false; });;

$('#facebook-login').on('click',function(){
	auth.login('facebook', {
		rememberMe: true,
		scope: 'email'
	});
});

function readItem(id, callback){
	firebaseList.child('public').child(id).once('value', function(snapshot) {
		console.log(snapshot.val());
		callback(snapshot.val());
	});
}

var readOnlyMode = true;

if(window.location.hash) {
	console.log('reading', window.location.hash.substring(1));
	readItem(window.location.hash.substring(1), function(data){
		console.log('Remote data retrieved: ',data);
		loadFromStorage(data.userGuess);
		$('#loader').fadeOut();
		$('#container').fadeIn();
		var date = new Date(data.timeStamp);
		var years = date.getFullYear();
		var months = date.getMonth();
		var days = date.getDate();
		var hours = date.getHours();
		var minutes = date.getMinutes();

		var formattedTime = days+'.'+months+'.'+years+' at '+hours + ':' + minutes;

		$('#restoreData #userName').text(data.facebookName);
		$('#restoreData #userTime').text(formattedTime);
		$('#restoreData').fadeIn();
	});	
} else {
	readOnlyMode = false;
	if (!(localStorage.data == undefined)) loadFromStorage(localStorage.data);
	$('#loader').fadeOut();
	$('#container').fadeIn();
}


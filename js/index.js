
function signIn() {
	console.log('signin')
	if (firebase.auth().currentUser) {
		console.log("logged in already")
		window.location.href = "./home.html";
	} else {
		var email = $('#inputEmail').val();
		var password = $('#inputPassword').val();
		if (email.length < 4) {
			alert('Please enter an email address.');
			return;
		}
		if (password.length < 4) {
			alert('Please enter a password.');
			return;
		}
		// Sign in with email and pass.
		// [START authwithemail]
		console.log("trying to log in")
		firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
			// Handle Errors here.
			var errorCode = error.code;
			var errorMessage = error.message;
			// [START_EXCLUDE]
			if (errorCode === 'auth/wrong-password') {
			alert('Wrong password.');
			} else {
			alert(errorMessage);
			}
			if(error){
			console.log('error happened');
			}
			// [END_EXCLUDE]
		});
		// [END authwithemail]
		}
	};

function accountCreate() {
	var email = $('#inputEmail').val();
	var password = $('#inputPassword').val();
	var password2 = $('#inputPassword2').val();
	var name = $('#inputName').val();
	/*
	  if (email.length < 4) {
		alert('Please enter an email address.');
		return;
	  }
	  */
	if (password != password2) {
		alert('Passwords do not match');
		return;
	}
	  if (password.length < 4) {
		alert('Please enter a password.');
		return;
	  }
	// Sign in with email and pass.
	// [START createwithemail]
	firebase.auth().createUserWithEmailAndPassword(email, password).then(function() {
		var user = firebase.auth().currentUser;
		/*
		user.sendEmailVerification().then(function() {
		 // Email sent.
		}, function(error) {
			console.log('failed to send sendEmailVerification')
		// An error happened.
		});
		*/
		console.log("before fb")
		firebase.database().ref('users/' + user.uid).update({
			email:email,
			name:name
			}).then(function(){
				var emailSplit = user.email.split(".");
				var emailDash = emailSplit[0]+"-"+emailSplit[1];
				firebase.database().ref('email/'+emailDash).set({
					id:user.uid
				});
				window.location.href = "./home.html";
			});
			
		}

		, function(error) {
		// Handle Errors here.
		var errorCode = error.code;
		var errorMessage = error.message;
		// [START_EXCLUDE]
		if (errorCode == 'auth/weak-password') {
			alert('The password is too weak.');
		} else {
			alert(errorMessage);
		}
		console.log(error.code);
		// [END_EXCLUDE]
	});
	// [END createwithemail]
	
} ;

function doForm() {
	var workoutType = $('#workoutType').val();
	var dateBlob = $('#myDate').val();
	var dateList = dateBlob.split("-");
	var day = dateList[2];
	var month = dateList[1];
	var year = dateList[0];
	var doy = getDOY(day,month,year);
	var duration = $('#duration').val();
	var exertion = $('#exertion').val();
	firebase.database().ref('activity/'+firebase.auth().currentUser.uid+"/"+year+"/"+doy).push({
		workoutType:workoutType,
		rawdate:dateBlob,
		doy:doy,
		duration:duration,
		exertion:exertion
	}).then(function() {window.location.href="./submitted.html"}) ;
	

}


//Date Calculations
function isLeapYear(year)  {
    if((year & 3) != 0) return false;
    return ((year % 100) != 0 || (year % 400) == 0);
};

// Get Day of Year
function getDOY(dn, mn, year){
    var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    var dayOfYear = dayCount[parseInt(mn)-1] + parseInt(dn);
    if(mn > 1 && isLeapYear(year)) dayOfYear++;
    return dayOfYear;
};

function testEmailAsKey(){
	var emailSplit = firebase.auth().currentUser.email.split(".");
	var emailDash = emailSplit[0]+"-"+emailSplit[1];
	firebase.database().ref('email/'+emailDash).set({
		id:firebase.auth().currentUser.uid
	}).then(function() {window.location.href="./lookup.html"}) ;
}

function lookupEmail() {
	var email = $('#ewmaEmail').val();

	var emailSplit = email.split(".");
	var emailDash = emailSplit[0]+"-"+emailSplit[1];
	

	var endDate = $('#endDate').val();
	var today = new Date();
	var endDoy;
	if(endDate==""){
		
		var day = today.getDate();
		var month = today.getMonth()+1;
		var year = today.getFullYear();
		endDoy = getDOY(day, month, year);
		console.log("no date provided")
	} else {
		var dateBlob = $('#endDate').val();
		console.log("date provided: "+ dateBlob)
		var dateList = dateBlob.split("-");
		var day = dateList[2];
		var month = dateList[1];
		var year = dateList[0];
		endDoy = getDOY(day,month,year);
		var prevYear = false;
		if(endDoy<28){
			prevYear=true;
			var lastYearsEnd = getDOY(31,12,year-1);
			var firstDay = lastYearsEnd - 28 + endDoy;
		}
	}
	console.log(endDoy)
	var emailId = firebase.database().ref('/email/' + emailDash);
	if (emailId) {
		emailId.once("value", function(snapshot) {
			if (snapshot.val()) {
				var id = snapshot.val().id
				console.log(id)
				console.log("in value")
				var activity = firebase.database().ref('/activity/' + id);
				if (activity) {
					activity.once("value", function(activityList) {
						if (activityList.val()) {
							var workoutsDict = activityList.val();
							console.log("in got activity?")
							console.log(workoutsDict)
							var workouts = {};
							var minIndex;
							if(prevYear) {
								console.log('prevYear')
								console.log(workoutsDict[prevYear])
								for(var i = firstDay; i<=lastYearsEnd; i++) {
									if(typeof workoutsDict[year-1][i] != "undefined"){
										if(!minIndex) {
											minIndex = i - lastYearsEnd;
										}
										workouts[i-lastYearsEnd] = (workoutsDict[year-1][i])
									}
								}
							}
							console.log(workoutsDict[year])
							for(var i = endDoy-28; i <=endDoy; i++) {
								if(typeof workoutsDict[year][i] != "undefined"){
									console.log(typeof workoutsDict[year][i])
									if(!minIndex) {
										minIndex = i;
									}
									workouts[i] = (workoutsDict[year][i])
								}
							}

							console.log(workouts)
							var emwaSum28 = 0;
					    	var emwaSum7 = 0;
					    	var n28 = 29;
					    	var n7 = 8;
							for (var i = endDoy-28; i <=endDoy; i++) {
								var power = endDoy-i;
							    if (typeof workouts[i] != "undefined") {
							    	console.log("defined workout")
							    	var daysWorkouts = workouts[i];
							    	
							    	for (var session in daysWorkouts) {
							    		console.log("session here")
							    		if (daysWorkouts.hasOwnProperty(session)) {
							    			console.log(power)
							    			var sess = daysWorkouts[session];

											emwaSum28 = emwaSum28 + parseInt(sess.exertion) * parseInt(sess.duration) * Math.pow(((n28-2)/n28), power) * (2/n28);
											if(power<7) {
												emwaSum7 = emwaSum7 + parseInt(sess.exertion) * parseInt(sess.duration) * Math.pow(((n7-2)/n7), power) * (2/n7);
											}
											console.log(parseInt(sess.exertion) * parseInt(session.duration) * Math.pow(((n7-2)/n7), power) * (2/n7))
											console.log("exertion: "+sess.exertion)
											console.log(sess.duration)
											console.log("power: ",Math.pow(((n7-2)/n7),power))
											console.log(emwaSum28)
											console.log(emwaSum7)
							    			console.log("should be here")
							    			
							        		document.getElementById("workoutsTable").insertRow(-1).innerHTML =
	"<tr><td>"+sess.rawdate+"</td><td>Duration: "+sess.duration+"</td> <td>Exertion: "+sess.exertion+"</td><td> type:"+sess.workoutType+"</td></tr>"
							        	}
							    	}

							    }
							}
							$('#ewma').append("Ewma 7:28 Ratio: "+emwaSum7/emwaSum28+"</br>Ewma7: "+emwaSum7+ "</br>Ewma28: "+emwaSum28)
						}

					});
				} else {
					console.log("no workouts found");
				}
			}
		});
	} else {
		console.log('no email matching')
	}




}

function getEwma(workouts, endDoy) {
	var emwaSum28;
	var emwaSum7;
	var n28 = 29;
	var n7 = 8;
	for (var i = endDoy-28; i <=endDoy; i++) {
		var power = endDoy-i;
	    if (typeof workouts[i] != "undefined") {
	    	console.log("defined workout")
	    	var daysWorkouts = workouts[i];
	    	
	    	for (var session in daysWorkouts) {
	    		console.log("session here")
	    		if (daysWorkouts.hasOwnProperty(session)) {
	    			var sess = daysWorkouts[session];
					emwaSum28 = emwaSum28 + sess.exertion * session.duration * ((n28-2)/n28)^ power * (2/n28);
					if(power<7) {
						emwaSum7 = emwaSum7 + sess.exertion * session.duration * ((n7-2)/n7)^ power * (2/n7);
					}

	    			
	        	}
	    	}

	    }
	}
	return {ewma7:emwaSum7, ewma28:emwaSum28}
}
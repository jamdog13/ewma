
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
		user.sendEmailVerification().then(function() {
		 // Email sent.
		}, function(error) {
			console.log('failed to send sendEmailVerification')
		// An error happened.
		});
		firebase.database().ref('users/' + user.uid).update({
			email:email,
			name:name
			});
			window.location.href = "./home.html";
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


//Date Calculations
function isLeapYear(year)  {
    if((year & 3) != 0) return false;
    return ((year % 100) != 0 || (year % 400) == 0);
};

// Get Day of Year
function getDOY(day, month, year){
    var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    var mn = this.getMonth();
    var dn = this.getDate();
    var dayOfYear = dayCount[mn] + dn;
    if(mn > 1 && this.isLeapYear()) dayOfYear++;
    return dayOfYear;
};
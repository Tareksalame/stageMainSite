import React, { useState,useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { Link, useNavigate } from 'react-router-dom'
import {GoogleOAuthProvider} from  '@react-oauth/google'
import { GoogleLogin } from '@react-oauth/google'
import jwt_decode from 'jwt-decode'
import './style.css'
import './signup.css'
import Cookies from 'js-cookie'
import axios from 'axios'

import { v4 as uuidv4 } from 'uuid';



export default function Home(props) {
const [emailLogin , setEmailLogin] = useState('')
const [passwordLogin,setPasswordLogin] = useState('')
const [password,setPassword] =useState('')
const [repeatPassword,setRepeatPassword] =useState('')
const [email,setEmail] =useState('')
const [activeTab, setActiveTab] = useState('sign-in');
const nav = useNavigate()


//new alert
const openModal = (message) => {
  const modal = document.getElementById('modal');
  const modalMessage = document.getElementById('modal-message');

  modalMessage.innerHTML = message;
  modal.style.display = 'block';

  // טיפול בלחיצה על כפתור הסגירה
  const closeBtn = document.querySelector('.close');
  closeBtn.onclick = () => {
    modal.style.display = 'none';
  };

  // טיפול בלחיצה במקום חיצוני - סגירת החלונית
  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  };
};


const signUp = async () => {
  //const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailRegex = /^[^\s@]+@[a-z]+\.[a-z]+$/;
  
  if(email!==''){
  if (!emailRegex.test(email)) {
    openModal('Invalid e-mail');
    return;
  }
}
else{
  openModal('please enter e-mail');
  return;
}

  if(password===''){
    openModal('please enter password');
    return;
  }

  if (repeatPassword != password) {
    openModal('Passwords do not match');
    return;
  }

  /*const checkEmail = props.users.find(val=> val.email === email)
  if (checkEmail) {
    openModal('This email already exists');
    return;
  }*/

  try {
    const response = await fetch('/checkUserExists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({email}),
    });
    const data = await response.json();
    
    if (data.exists) {
      //document.getElementById('msg').innerHTML = 'User already exists'
      openModal('User already exists');
      console.log('User already exists')
    } else {
      props.addUsers( password, repeatPassword, email,uuidv4());
      setActiveTab('sign-in');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

const signIn = () => {
  const data = {
    email: emailLogin,
    password: passwordLogin,
  };

 

  fetch('/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {

        
        const name= result.user.name
        const passw=result.user.pass

        if (emailLogin!==name) {
          openModal('The email or password is incorrect');
          return;
        }
        if (passwordLogin!==passw) {
          openModal('The email or password is incorrect');
          return;
        }

        // התחברות מוצלחת - שמירת המשתמש ב-Cookie
        Cookies.set('currentUser', result.user.id, { expires: 7 }); // שמירת ה-id של המשתמש בתוך ה-Cookie

        // עבירה לדף המשתמש
        nav(`/user/${result.user.id}`);


      } else {
        openModal('The email or password is incorrect');
      }
    })
    .catch((error) => {
      console.error('An error occurred:', error);
    });
};

// פונקציה להתנתקות משתמש




const handlePasswordChange = (e) => {
  setPassword(e.target.value);
};

const handleRepeatPasswordChange = (e) => {
  setRepeatPassword(e.target.value);
};

const handleEmailChange = (e) => {
  setEmail(e.target.value);
};
const handleTabChange = (tab) => {
  setActiveTab(tab);
};



const [isLoggedIn, setIsLoggedIn] = useState(false);


const handleUserCheckboxChange = () => {
  const newValue = !isLoggedIn;
  setIsLoggedIn(newValue);
  localStorage.setItem('isUserLoggedIn', JSON.stringify(newValue));

  if (!newValue) {
    // המשתמש התנתק - מחיקת ה-Cookie של המשתמש
    Cookies.remove('currentUser');
    // ניתוב לדף הראשי
    nav('/');
  }
};
const handlePageLoad = () => {
  const currentUser = Cookies.get('currentUser');

  if (!isLoggedIn) {
    // המשתמש לא מחובר - ניתוב לדף הראשי
    nav('/');
  } else if (isLoggedIn && currentUser && window.location.pathname !== `/user/${currentUser}`) {
    // יש משתמש מחובר ורוצה לעבור לדף אחר - ניתוב לדף המשתמש המתאים
    nav(`/user/${currentUser}`);
  }
};

useEffect(() => {
  const storedValue = localStorage.getItem('isUserLoggedIn');
  if (storedValue) {
    setIsLoggedIn(JSON.parse(storedValue));
  }

  const storedUserName = localStorage.getItem('emailLogin');
  if (storedUserName) {
    setEmailLogin(storedUserName);
  }
}, []);

useEffect(() => {
  handlePageLoad();
}, [isLoggedIn]); // הוספנו את המשתנה isLoggedIn כמערך תלות לפונקציית useEffect

  return (
    <div >

<section className="hero">
    <div className="container text-center">
      <div className ="row">
        <div className="col-md-12">
         
        </div>
      </div>

     
      <h1 className='title'>PLAN YOUR TRADE FOR FREE </h1>
      <h2 className='title'>(Beta Version)</h2>      
    
      <div className="col-md-12">

      

      
        <div className="login-wrap" >
          

        <div id="modal" class="modal">
  <div id="modal-content" class="modal-content">
    <span id="close" class="close">&times;</span>
    <p id="modal-message"></p>
  </div>
</div>

          


	<div className="login-html">
		<input id="tab-1"  onChange={() => handleTabChange('sign-in')}   checked={activeTab === 'sign-in'} type="radio" name="tab" className="sign-in" /><label htmlFor="tab-1" className="tab">Sign In</label>
		<input id="tab-2"   onChange={() => handleTabChange('sign-up')}   checked={activeTab === 'sign-up'}  type="radio" name="tab" className="sign-up"/><label htmlFor="tab-2" className="tab">|   Sign Up</label>
		<div className="login-form">
			<div className="sign-in-htm">
				<div className="group">
        <label htmlFor="pass" className="label">Email</label>
					<input id="pass" onChange={(e)=>{setEmailLogin(e.target.value)}} type="text" className="input" onInput={(e) => {
    e.target.value = e.target.value.replace(/[^A-Za-z0-9@.]/g, '');
  }}/>
				</div>
				<div className="group">
					<label htmlFor="pass" className="label">Password</label>
					<input id="pass" onChange={(e)=>{setPasswordLogin(e.target.value)}}  type="password" className="input" data-type="password"  onInput={(e) => {
    e.target.value = e.target.value.replace(/[^A-Za-z0-9]/g, '');
  }}/>
				</div>
				<div className="group">
    <label id='labelCheck' > 
  <input style={{marginRight:'5px'}}
  type="checkbox"
  checked={isLoggedIn}
  onChange={handleUserCheckboxChange}
/>Keep me signed in</label>
    
				</div>
				<div className="group">
					<input id='btnSignin' onClick={()=>{signIn()}} type="submit" className="button" value="Sign In"/>
				</div>
				<div className="hr"></div>
				<div className="foot-lnk">
				<Link to={'/forget'}><a id='forget'  >Forgot Password?</a></Link>
				</div>

        <div id='signInDIV'>

   <GoogleOAuthProvider clientId='814601776904-lmd5p5dvjbk2jm7515oes7anjglqpe29.apps.googleusercontent.com'>
  <GoogleLogin  onSuccess={credentialResponse=>{

const details=jwt_decode(credentialResponse.credential)
let random=Math.random().toString(36).slice(-8);

let c=0;

props.users.forEach((val)=>{

  if(val.email===details.email){
    c++;
  }

})

if(c===0){
  props.addUsers( random, random, details.email,uuidv4())
}

console.log(details)

  if(details.email){

    
    
    nav(`/user/${details.email}`)

  }




}}

onError={()=>{
console.log('login failed');
}}

/>

</GoogleOAuthProvider>



</div>





			</div>
			<div className="sign-up-htm">


     
<div id="modal" class="modal">
  <div id="modal-content" class="modal-content">
    <span id="close" class="close">&times;</span>
    <p id="modal-message"></p>
  </div>
</div>

<div className="group">
					<label htmlFor="pass" style={{whiteSpace:'nowrap',position:'relative',left:'20px'}} className="label">Email Address</label>
					<input id="pass" onChange={handleEmailChange}  type="text" className="input" onInput={(e) => {
    e.target.value = e.target.value.replace(/[^A-Za-z0-9@.]/g, '');
  }}/>
				</div>
		
				<div className="group">
					<label htmlFor="pass" className="label">Password</label>
					<input id="pass" onChange={handlePasswordChange}   type="password" className="input" data-type="password" onInput={(e) => {
    e.target.value = e.target.value.replace(/[^A-Za-z0-9]/g, '');
  }}/>
				</div>
				<div className="group">
					<label htmlFor="pass" id='repet' style={{whiteSpace:'nowrap',position:'relative',left:'10px'}} className="label">Repeat Password</label>
					<input id="pass" onChange={handleRepeatPasswordChange}  type="password" className="input" data-type="password" onInput={(e) => {
    e.target.value = e.target.value.replace(/[^A-Za-z0-9]/g, '');
  }}/>
				</div>
	
				<div className="group">
					<input onClick={()=>{signUp()}} type="submit" id='btnsignup' className="button" value="Sign Up"/>
          <h2  id='msg'></h2>
				</div>
				
				<div className="foot-lnk">
				
				</div>
			</div>
		</div>
	</div>
</div>

      
      </div>
    </div>

  </section>





    </div>
  )
}

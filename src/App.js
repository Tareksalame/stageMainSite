import React from 'react';
import './App.css';
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import { useState,useEffect } from 'react';
import Table from './components/Table';
import Package1 from './components/Package1';
import Package2 from './components/Package2';
import Package3 from './components/Package3';
import Registr from './components/Registr';
import Home from './components/Home'
import Reshom from './components/Reshom';
import ForgetPassword from './components/ForgetPassword'
import { v4 as uuidv4 } from 'uuid';
import ResetPassword from './components/ResetPassword';
import axios from 'axios';
import Registrationsuccess from './components/Registrationsuccess';



function App() {


  const defaultRow = {
    Ticker:'',
    Quantity:0,
    price:0,
    actualPrice:0,
    ExitPrice:0,
    StopLose:0,
    TotalCost:'',
    ExpectedProfit:'',
    ExpectedLose:''
  };

  

const [startTime, setStartTime] = useState(null);
const [users,setUsers] =useState([])

console.log(`users:${users}`);

  //rows
  const [row,setRow]=useState(25)

  const [flag,setFlag]=useState(false)

  const [currentUser, setCurrentUser] = useState(null);

//TickerArr
  const [Tickers, setTickers] = useState([defaultRow]);
    



  // localStorage row
 /* useEffect(() => {
    // Save the value to localStorage whenever it changes
    localStorage.setItem(`user${firstName}`, row);
  }, [row]);
   
 
// Retrieve the stored row value from localStorage on component mount
useEffect(() => {
  const storedRow = localStorage.getItem(`row_${firstName}`);
  if (storedRow) {
    setRow(parseInt(storedRow));
  } else {
    setRow(9);
  }
}, [firstName]);

// Get user first name
const getName = (n) => {
  setFirstName(n);
};

// Define a state variable for the row
const [row, setRow] = useState(() => {
  const storedRow = localStorage.getItem(`row_${firstName}`);
  return storedRow ? parseInt(storedRow) : 9;
});

// Update the row whenever it changes
useEffect(() => {
  localStorage.setItem(`row_${firstName}`, row.toString());
}, [row, firstName]);
  
*/

useEffect(() => {

  fetch('/getData')
    .then((res) => {
      return res.json()
    })
    .then((data) => {
      //setUsers(prevUsers => [...prevUsers, data]);
      setUsers(data)
    })


}, [flag])

  
const [data,setData] = useState(null)

const addUsers = ( p, r, e,i) => {
  const userData = {
    password: p,
    repetPassword: r,
    email: e,
    id:i,
    Tickers: [defaultRow],
  };

  fetch('/addUser', {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'post',
    body: JSON.stringify({ user: userData })
  })
  .then((res)=>{
    return res.json()
  })
  .then((data)=>{
    setFlag(!flag)
  })
  .catch((err) => {
    console.log(err);
  })
  
};



  // שומר את הנתונים בדפדפן
  const loadStateFromLocalStorage = () => {
    const storedState = localStorage.getItem('appState');
    if (storedState) {
      const state = JSON.parse(storedState);
      if (state && state.users) {
        setUsers(state.users);
        // check if currentUser exists in LocalStorage
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
          setCurrentUser(currentUser);
          // Load current user state if user exists
          loadUserStateFromLocalStorage(currentUser);
        } else {
          // handle case when no user exists in LocalStorage
        }
      }
    }
  };
  
  const saveStateToLocalStorage = () => {
    const state = {
      users,
      currentUser: currentUser,
    };
    localStorage.setItem('appState', JSON.stringify(state));
    localStorage.setItem('currentUser', currentUser);
  };
  
  const loadUserStateFromLocalStorage = (user) => {
    const storedState = localStorage.getItem(`appState_${user}`);
    if (storedState) {
      const state = JSON.parse(storedState);
      setTickers(state.tickers);
    }
  };
  
  const saveUserStateToLocalStorage = () => {
    const state = {
      tickers: Tickers,
    };
    localStorage.setItem(`appState_${currentUser}`, JSON.stringify(state));
  };
  
  useEffect(() => {
    loadStateFromLocalStorage();
  }, []);
  
  useEffect(() => {
    saveStateToLocalStorage();
    if (currentUser) {
      saveUserStateToLocalStorage();
    }
  }, [users, Tickers, currentUser,defaultRow]);


  
//מוחקת שורות מהטבלה
/*const delRow = (username, rowIndex) => {
  const updatedUsers = [...users];
  const userIndex = updatedUsers.findIndex(user => user.id === username);

  if(userIndex !== -1) {
    const updatedUser = { ...updatedUsers[userIndex] };
    if (rowIndex >= 0 && rowIndex < updatedUser.Tickers.length) {
      updatedUser.Tickers.splice(rowIndex, 1);
      console.log(updatedUser.Tickers)
      if(updatedUser.Tickers.length === 0) {
        updatedUser.Tickers.push(defaultRow);
      }
      updatedUsers[userIndex] = updatedUser;
      setUsers(updatedUsers);
      localStorage.setItem('Users', JSON.stringify(updatedUsers));

      // Request to the server to delete the row
      fetch(`/delRows/users/${username}/rows/${rowIndex}`, {
        method: 'DELETE'
      })
      .then(response => response.json())
      .then(data => console.log(data.message))
      .catch(error => console.error('Error:', error));
    } else {
      console.log(`Row index ${rowIndex} not found for user ${username}`);
    }
  } else {
    console.log(`User ${username} not found`);
  }
}

*/


//עובד על זה
 //מוחקת שורות מהטבלה
 const delRow = (id, rowIndex) => {
  const updatedUsers = [...users];
  const userIndex = updatedUsers.findIndex(user => user.id === id);
  console.log(userIndex)

  if(userIndex !== -1) {
    const updatedUser = { ...updatedUsers[userIndex] };
    if (rowIndex >= 0 && rowIndex < updatedUser.Tickers.length) {
      updatedUser.Tickers.splice(rowIndex, 1);
      console.log(updatedUser.Tickers)
      if(updatedUser.Tickers.length === 0) {
        updatedUser.Tickers.push(defaultRow);
      }
      updatedUsers[userIndex] = updatedUser;
      setUsers(updatedUsers);
      console.log(updatedUsers)
      

      for(let i=0;i<updatedUser.Tickers.length;i++){

        let t=''
        let q=0
        let p=0
        let e=0
        let s=0
        let actual=0;
       


          let val=updatedUser.Tickers[i]

          t=val.Ticker
          q=val.Quantity
          p=val.price
          actual=val.actualPrice
          e=val.ExitPrice
          s=val.stopLose


        let index=i;
        document.getElementById(`Ticker${index}`).value=t
        document.getElementById(`quantity${index}`).value=q
        document.getElementById(`price${index}`).value=p
        document.getElementById(`Actual${index}`).innerHTML=`$${actual}`
        document.getElementById(`exit${index}`).value=e
        document.getElementById(`stop${index}`).value=s
      }

      // Request to the server to delete the row
      let username=id
      fetch(`/delRows/users/${username}/rows/${rowIndex}`, {
        method: 'DELETE'
      })
      .then(response => response.json())
      .then(data => console.log(data.message))
      .catch(error => console.error('Error:', error));
      
      
    } else {
      console.log(`Row index ${rowIndex} not found for user ${id}`);
    }
  } else {
    console.log(`User ${id} not found`);
  }

  
  
}






//מוסיפה שורה עם נתונים
const addTickers = (t, q, p, e, sl,total,Expected,Lose,actual, index) => {
  const newTicker = {
    Ticker: String(t),
    Quantity: Number(q),
    price: Number(p),
    actualPrice:Number(actual),
    ExitPrice: Number(e),
    stopLose: Number(sl),
    TotalCost: 0,
    ExpectedProfit: 0,
    ExpectedLose:0,
    

  };
  
  console.log(newTicker.stopLose);

  // updating the state in React
  if (users[index].Tickers.length < row) {
    setUsers(currentUsers => {
      const updatedUsers = [...currentUsers];
      updatedUsers[index].Tickers = [...updatedUsers[index].Tickers, newTicker];
      console.log(`lose${updatedUsers[index].Tickers}`);
      return updatedUsers;
    });
  }
  

  // Sending the request to the server
  fetch('/addTicker', {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'post',
    body: JSON.stringify({
      email: users[index].email, // assuming each user object has an email field
      ticker: users[index].Tickers
    })
  })
  .then(res => res.json())
  .then(data => {
    //setFlag(!flag);
  });
  
  newTicker.price=0;
  newTicker.Quantity=0;

};









const saveData = ()=>{
 console.log('data is saved');
}



const deleteAll = (username,bool) => {

  
  if (bool) {
    const updatedUsers = [...users];
    const userIndex = updatedUsers.findIndex(user => user.id === username);

    if (userIndex !== -1) {
      const updatedUser = { ...updatedUsers[userIndex] };
      updatedUsers[userIndex] = updatedUser;
      updatedUser.Tickers = [defaultRow]; // reset the Tickers array to defaultRow
      updatedUsers[userIndex] = updatedUser;
      setUsers(updatedUsers);
      localStorage.setItem('Users', JSON.stringify(updatedUsers));

      // Sending the request to the server
      fetch(`/deleteAll/${username}`, { // assuming username is unique
        method: 'DELETE',
      })
      .then(res => res.json())
      .then(data => console.log(data.message))
      .catch(err => console.error(err));

      // Clearing the input values
      Tickers.forEach((val, index) => {
        
        document.getElementById(`Actual${index}`).innerHTML = '';
        document.getElementById(`quantity${index}`).value = '';
        document.getElementById(`Ticker${index}`).value = '';
        document.getElementById(`price${index}`).value = '';
        document.getElementById(`exit${index}`).value = '';
        document.getElementById(`stop${index}`).value = '';
      });
    } else {
      console.log(`User ${username} not found`);
    }
  }
};








  return (
    <div className="App">
   


    <BrowserRouter>
    <Routes>
    <Route  path='/' element = {<Home addUsers = {addUsers} users = {users}         />}         />
    {users.map((val, index) => {

return <Route  path={`/user/${val.email}`} element={<Table  row={row} id = {val.id}  defaultRow = {defaultRow} email = {val.email} users={users} setFlag ={setFlag} index={index} Ticker = {val.Ticker} Quantity={val.Quantity} price={val.price} ExpectedLose={val.ExpectedLose} ExitPrice={val.ExitPrice} stopLose={val.stopLose} setUsers={setUsers} deleteAll={deleteAll}  data={data} saveData={saveData}  Tickers={val.Tickers} addTickers={addTickers} delRow={delRow} setTickers={setTickers} />} />
})}
{users.map((val, index) => {

return <Route    path={`/user/${val.id}`} element={<Table  row={row} id = {val.id}  defaultRow = {defaultRow} email = {val.email} users={users} setFlag ={setFlag} index={index} Ticker = {val.Ticker} Quantity={val.Quantity} price={val.price} ExpectedLose={val.ExpectedLose} ExitPrice={val.ExitPrice} stopLose={val.stopLose} setUsers={setUsers} deleteAll={deleteAll}  data={data} saveData={saveData} Tickers={val.Tickers} addTickers={addTickers} delRow={delRow} setTickers={setTickers} />} />
})}
<Route path='/package1' element={<Package1 setRow={setRow} setTickers = {setTickers} Tickers = {Tickers}  />}/>
<Route path='/package2' element={<Package2 setRow={setRow}/>}/>
<Route path='/package3' element={<Package3 setRow={setRow}/>}/>
<Route path='/registr' element={<Registr   />}/>
{users.map((val,index)=>{
  return <Route path='/reshom' element={<Reshom userName = {val.email}  users = {users}   />}/>

})}


<Route path='/forget'  element = {<ForgetPassword  users = {users}     />}           />



 <Route path={`/resetPassword`} element = {<ResetPassword   users = {users}        />}            />

 <Route path={`/registration-success`} element={<Registrationsuccess/>}/>

</Routes>



</BrowserRouter>




    </div>
  );
}

export default App;
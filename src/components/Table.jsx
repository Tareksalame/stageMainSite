import React, { useState,useEffect } from 'react'
import './style.css'

import { json, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie'
import Modal  from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';





export default function Table(props) {


const [Ticker,setTicker] =useState('')
 const[exitPrice,setExitPrice] =useState(0)
const[stopLose,setStopLose] =useState(0)
const[Quantity,setQuantity] = useState(0)
const[price,setPrice] = useState(0)
const [chengeConditoin, setCengeConditoin] = useState( props.Tickers.map((_, index) => 'Buy'));

//new hook for buy//sell
const [buySellStatus,setbuySellStatus]=useState('Buy')



const nav = useNavigate()
//מחשב את כל הכסף

let sumCost = 0;
props.Tickers.forEach((val) => {
  sumCost += val.TotalCost;
});

let sumProfit = 0;
props.Tickers.forEach((val) => {
  sumProfit += val.ExpectedProfit;
});

let presProfit = 0;
props.Tickers.forEach((val) => {
  if(val.TotalCost>0 && val.ExpectedProfit>0){
    presProfit += Math.round((val.ExpectedProfit / val.TotalCost) * 100);
  }
  else if(val.ExpectedProfit<0){
    presProfit = String('null')
  }
   

  
});

let sumLose = 0;
props.Tickers.forEach((val) => {
  sumLose += val.ExpectedLose;
});

let presLose = 0;
props.Tickers.forEach((val) => {

  if(val.TotalCost>0){
  presLose += Math.round((val.ExpectedLose / val.TotalCost)) * 100;
  }
  
});




const buyAndSell = (index, buySell) => {


  const row = props.Tickers[index];
  const price = row.price;
  const stopLose = row.stopLose;
  const Quantity = row.Quantity;
  const ExitPrice = row.ExitPrice;
  

  setbuySellStatus(buySell)

  let profit = 0;
  let lose = '';

  

  if (buySell === 'Buy') {

    

    if (stopLose) {
      lose = -((Quantity * stopLose) - (Quantity * price));
    }

    if(exitPrice){
     //profit = (price * Quantity) - (ExitPrice * Quantity);
      profit = (ExitPrice * Quantity) - (price * Quantity);
    }
    
  } else if (buySell === 'Sell') {

    

    if(exitPrice){
     //profit = (ExitPrice * Quantity) - (price * Quantity);
     profit = (price * Quantity) - (ExitPrice * Quantity);
    }
    
    if (stopLose) {
      lose = (Quantity * stopLose) - (Quantity * price);
    }
    
  }


  /*props.setTickers((prev) => {
    const newTickers = [...prev];
    newTickers[index]['ExpectedProfit'] = profit;
    newTickers[index]['ExpectedLose'] = Math.abs(lose);
    return newTickers;
  });*/


  props.setTickers((prev) => {
    const newTickers = [...prev];
    if (newTickers[index]) {
      newTickers[index]['ExpectedProfit'] = profit;
      newTickers[index]['ExpectedLoss'] = Math.abs(lose);
    }
    return newTickers;
  });


};




const [actualPrice,setActualPrice] = useState(0)




//הצגת נתונים בטבלה 
const handleChange = (index, key, value) => {
  const newTickers = [...props.Tickers];
  newTickers[index][key] = Number(value);
  newTickers[index][key] = String(value);
  

  if (key === 'Ticker') {
    const uppercaseInput = value.toUpperCase();
    setTicker(String(uppercaseInput));
    axios
      .get(`https://finnhub.io/api/v1/quote?symbol=${value}&token=${apiKey}`)
      .then((response) => {
        const stockPrice = response.data.c;
        setActualPrice(Number(stockPrice));
        document.getElementById(`Actual${index}`).innerHTML = `$${stockPrice}`;
        newTickers[index].price = Number(stockPrice);
        newTickers[index].actualPrice = Number(stockPrice);
        setPrice(Number(stockPrice));

        if (newTickers[index].Quantity && newTickers[index].price) {
          newTickers[index].TotalCost = newTickers[index].Quantity * newTickers[index].price;
        } else {
          newTickers[index].TotalCost = 0;
        }

        if (value && exitPrice && Quantity) {
          newTickers[index].ExpectedProfit =
          newTickers[index].ExitPrice * newTickers[index].Quantity - newTickers[index].Quantity * actualPrice;
        }
        else{
          newTickers[index].ExpectedProfit =0;
        }


        if (actualPrice && stopLose && Quantity) {
          newTickers[index].ExpectedLose = Math.abs(
            newTickers[index].stopLose * newTickers[index].Quantity - actualPrice * newTickers[index].Quantity
          );
        } else {
          newTickers[index].ExpectedLose = 0;
        }


        localStorage.setItem('Tickers', JSON.stringify(newTickers));
        localStorage.setItem('TickerValue', value);
        props.setTickers(newTickers);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  } else if (key === 'price') {
    setPrice(Number(value));
    newTickers[index].price = Number(value);

    if (newTickers[index].Quantity && newTickers[index].price) {
      newTickers[index].TotalCost = newTickers[index].Quantity * newTickers[index].price;
    } else if (newTickers[index].Quantity && !newTickers[index].price) {
      newTickers[index].TotalCost = newTickers[index].Quantity * actualPrice;
    } else {
      newTickers[index].TotalCost = 0;
    }

    localStorage.setItem('Tickers', JSON.stringify(newTickers));
    localStorage.setItem('priceValue', value);
    props.setTickers(newTickers);

    if (value && exitPrice && Quantity) {
        newTickers[index].ExpectedProfit =
        newTickers[index].ExitPrice * newTickers[index].Quantity - newTickers[index].Quantity * newTickers[index].price;

        
    }
    else if(value===0 || value==='' && exitPrice && Quantity){
      newTickers[index].ExpectedProfit =
        newTickers[index].ExitPrice * newTickers[index].Quantity - newTickers[index].Quantity * actualPrice;
    }
     else {
      newTickers[index].ExpectedProfit =0
        
    }

    if (value && stopLose && Quantity) {
      newTickers[index].ExpectedLose = Math.abs(
        newTickers[index].stopLose * newTickers[index].Quantity - newTickers[index].price * newTickers[index].Quantity
      );
    }else if(value===0 || value==='' && stopLose && Quantity){
      newTickers[index].ExpectedLose = Math.abs(
        newTickers[index].stopLose * newTickers[index].Quantity - actualPrice * newTickers[index].Quantity
      );
    }
     else {
      newTickers[index].ExpectedLose = 0;
    }

    

    
  } else if (key === 'Quantity') {
    setQuantity(Number(value));
    newTickers[index].Quantity = Number(value);

    if (newTickers[index].Quantity && newTickers[index].price) {
      newTickers[index].TotalCost = newTickers[index].Quantity * newTickers[index].price;
    }
   else if (newTickers[index].Quantity && !newTickers[index].price) {
    newTickers[index].TotalCost = newTickers[index].Quantity * actualPrice;
  }else {
      newTickers[index].TotalCost = 0;
    }


    if (value && stopLose && stopLose>0 && price) {
      newTickers[index].ExpectedLose = Math.abs(
        newTickers[index].stopLose * newTickers[index].Quantity - newTickers[index].price * newTickers[index].Quantity
      );
    } else {
      newTickers[index].ExpectedLose = 0;
    }

    

    
    localStorage.setItem('Tickers', JSON.stringify(newTickers));
    localStorage.setItem('inputValue', value);
    props.setTickers(newTickers);
    

    //when change quantity expicted profit changed
    if (value && exitPrice) {
      newTickers[index].ExpectedProfit =
        newTickers[index].ExitPrice * newTickers[index].Quantity - newTickers[index].Quantity * newTickers[index].price;
    } else {
      newTickers[index].ExpectedProfit = 0;
    }

    /*if(one>0){
      setActualPrice(0)
    }
    setOne(0)*/
    
  } else if (key === 'ExitPrice') {
    setExitPrice(Number(value));
    newTickers[index].ExitPrice = Number(value);

    if (value && Quantity && price) {
      newTickers[index].ExpectedProfit =
        newTickers[index].ExitPrice * newTickers[index].Quantity - newTickers[index].Quantity * newTickers[index].price;
    }
    else if(value && Quantity && price===0 || price===''){
      newTickers[index].ExpectedProfit =
        newTickers[index].ExitPrice * newTickers[index].Quantity - newTickers[index].Quantity * actualPrice;
    }
     else {
      newTickers[index].ExpectedProfit = 0;
    }

    localStorage.setItem('Tickers', JSON.stringify(newTickers));
    localStorage.setItem('exitValue', value);
    props.setTickers(newTickers);
  } else if (key === 'stopLose') {
    setStopLose(Number(value));
    newTickers[index].StopLose = Number(value);

    if (value) {
      newTickers[index].ExpectedLose = Math.abs(
        newTickers[index].stopLose * newTickers[index].Quantity - newTickers[index].price * newTickers[index].Quantity
      );
    } else {
      newTickers[index].ExpectedLose = 0;
    }

    /*if (!newTickers[index].Quantity || !newTickers[index].price) {
      newTickers[index].TotalCost = 0;
    }*/

    localStorage.setItem('Tickers', JSON.stringify(newTickers));
    localStorage.setItem('stopValue', value);
    props.setTickers(newTickers);
  }

  //setActualPrice(0)
};

//החלפת צבע של הכפתורים
const chengeColor = (index, type) => {
  setCengeConditoin(prevChengeConditoin => {
    const newchengeConditoin = [...prevChengeConditoin];
    newchengeConditoin[index] = type;
    return newchengeConditoin;
  });
};


//מנקה את השורה הראשונה
const clearButton = (username,index) => {
  const updatedUsers = [...props.users];
  console.log(updatedUsers)
  const userIndex = updatedUsers.findIndex((user) => user.email === username);

  if (userIndex !== -1) {
    const updatedUser = { ...updatedUsers[userIndex] };
    updatedUser.Tickers = [props.defaultRow]; // reset the Tickers array to defaultRow
    updatedUsers[userIndex] = updatedUser;
    props.setUsers(updatedUsers);
    localStorage.setItem('Users', JSON.stringify(updatedUsers));
    document.getElementById(`Ticker${index}`).value = ''
    document.getElementById(`quantity${index}`).value = ''
    document.getElementById(`price${index}`).value = ''
    document.getElementById(`exit${index}`).value = ''
    document.getElementById(`stop${index}`).value = ''
    document.getElementById(`Actual${index}`).innerHTML=''

    setPrice('')
    setQuantity('')
    setStopLose('')
    setExitPrice('')
    setActualPrice(0)

    localStorage.setItem(`exit${index}`, '');
    localStorage.setItem(`stop${index}`, '');
  }
};




// save input value
/*useEffect(() => {
  const savedValue = localStorage.getItem('inputValue');
  if (savedValue) {
    setQuantity(savedValue);
    
    props.Tickers.forEach((val,index)=>{
      if(index===props.Tickers.length){
        if(props.Tickers.Quantity===0){
          document.getElementById(`quantity${index}`).value='';
        }
        return;
      }
      if(val.Quantity===0){
        document.getElementById(`quantity${index}`).value='';
      }
      else{
        document.getElementById(`quantity${index}`).value=val.Quantity;
      }
      
    });
  } else {
    localStorage.setItem('inputValue', JSON.stringify(props.defaultRow.Quantity));
  }
}, []);

useEffect(() => {
  const savedValue = localStorage.getItem('TickerValue');
  if (savedValue) {
    setTicker(savedValue);
    
    props.Tickers.forEach((val,index)=>{
      if(index===props.Tickers.length){
        if(props.Tickers.Ticker===''){
          document.getElementById(`Ticker${index}`).value='';
        }
        return;
      }
      document.getElementById(`Ticker${index}`).value=val.Ticker;
    });
  } else {
    localStorage.setItem('TickerValue', JSON.stringify(props.defaultRow.Ticker));
  }
}, []);

useEffect(() => {
  const savedValue = localStorage.getItem('priceValue');
  if (savedValue) {
    setPrice(savedValue);
    
    props.Tickers.forEach((val,index)=>{
      if(index===props.Tickers.length){
        if(props.Tickers.price===0){
          document.getElementById(`price${index}`).value='';
        }
        return;
      }
      if(val.price===0){
        document.getElementById(`price${index}`).value='';
      }
      else{
        document.getElementById(`price${index}`).value=val.price;
      }
      
    });
  } else {
    localStorage.setItem('priceValue', JSON.stringify(props.defaultRow.price));
  }
}, []);

useEffect(() => {
  const savedValue = localStorage.getItem('exitValue');
  if (savedValue) {
    setExitPrice(savedValue);
    
    props.Tickers.forEach((val,index)=>{
      if(index===props.Tickers.length){
        if(props.Tickers.ExitPrice===0){
          document.getElementById(`exit${index}`).value='';
        }
        return;
      }
      if(val.ExitPrice===0){
        document.getElementById(`exit${index}`).value='';
      }
      else{
        document.getElementById(`exit${index}`).value=val.ExitPrice;
      }
    });
  } else {
    localStorage.setItem('exitValue', JSON.stringify(props.defaultRow.ExitPrice));
  }
}, []);

useEffect(() => {
  const savedValue = localStorage.getItem('stopValue');
  if (savedValue) {
    setStopLose(savedValue);
    
    props.Tickers.forEach((val,index)=>{
      if(index===props.Tickers.length){
        if(props.Tickers.StopLose===0){
          document.getElementById(`stop${index}`).value='';
        }
        return;
      }
      document.getElementById(`stop${index}`).value=val.StopLose;
    });
  } else {
    localStorage.setItem('stopValue', JSON.stringify(props.defaultRow.StopLose));
  }
}, []);
*/

useEffect(() => {
  props.Tickers.forEach((ticker, index) => {
    const savedQuantity = localStorage.getItem(`quantity${index}`);
    if (savedQuantity !== null) {
      if (ticker.Quantity === 0) {
        document.getElementById(`quantity${index}`).value = '';
      } else {
        document.getElementById(`quantity${index}`).value = ticker.Quantity;
      }
    } else {
      localStorage.setItem(`quantity${index}`, JSON.stringify(props.defaultRow.Quantity));
    }

    const savedTicker = localStorage.getItem(`Ticker${index}`);
    if (savedTicker !== null) {
      document.getElementById(`Ticker${index}`).value = ticker.Ticker || '';
    } else {
      localStorage.setItem(`Ticker${index}`, JSON.stringify(props.defaultRow.Ticker));
    }

    const savedPrice = localStorage.getItem(`price${index}`);
    if (savedPrice !== null) {
      if (ticker.price === 0) {
        document.getElementById(`price${index}`).value = '';
      } else {
        document.getElementById(`price${index}`).value = ticker.price;
      }
    } else {
      localStorage.setItem(`price${index}`, JSON.stringify(props.defaultRow.price));
    }

    const savedExitPrice = localStorage.getItem(`exit${index}`);
    if (savedExitPrice !== null) {
      if (ticker.ExitPrice === 0) {
        document.getElementById(`exit${index}`).value = '';
      } else {
        document.getElementById(`exit${index}`).value = ticker.ExitPrice;
      }
    } else {
      localStorage.setItem(`exit${index}`, JSON.stringify(props.defaultRow.ExitPrice));
    }

    const savedStopLose = localStorage.getItem(`stop${index}`);
    if (savedStopLose !== null) {
      document.getElementById(`stop${index}`).value = ticker.StopLose || '';
    } else {
      localStorage.setItem(`stop${index}`, JSON.stringify(props.defaultRow.StopLose));
    }

    const savedactualPrice = localStorage.getItem(`Actual${index}`);
    if (savedactualPrice !== null) {
      document.getElementById(`Actual${index}`).innerHTML = `$${ticker.actualPrice}` || '';
    } else {
      localStorage.setItem(`Actual${index}`, JSON.stringify(props.defaultRow.actualPrice));
    }

  });
}, []);





const apiKey = 'ci26vg1r01qqjoq0o0ngci26vg1r01qqjoq0o0o0';
useEffect(() => {
  const fetchStockPrice = async () => {
    try {
      const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${Ticker}&token=${apiKey}`);
      const price = response.data.c;
      setPrice(price);
      setActualPrice(price)
      
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (Ticker) {
    fetchStockPrice();
  }

}, [Ticker]);




const inputes = (row) => {

  //const row = 25
  if(props.Tickers.length === row){
    
    alert('You can no longer add a line')
  
  }
  else{

    let index=props.Tickers.length-1;
  
    /*let Ticker1=document.getElementById(`Ticker${index}`).value;
    let Quantity1=document.getElementById(`quantity${index}`).value;
    let price1=document.getElementById(`price${index}`).value;
    let actualPrice1=document.getElementById(`Actual${index}`).innerHTML;
    let exitPrice1=document.getElementById(`exit${index}`).value;
    let stopLose1=document.getElementById(`stop${index}`).value;*/

    const Ticker1 = document.getElementById(`Ticker${index}`).value;
    const Quantity1 = document.getElementById(`quantity${index}`).value;
    const price1 = parseFloat(document.getElementById(`price${index}`).value);
    const actualPrice1 = document.getElementById(`Actual${index}`).innerHTML;
    const exitPrice1 = parseFloat(document.getElementById(`exit${index}`).value);
    const stopLose1 = parseFloat(document.getElementById(`stop${index}`).value);
    const totalCost = document.getElementById(`'totalCost'${index}`).innerHTML; 
    const ExpectedProfit = document.getElementById(`Expected Profit${index}`).innerHTML;
    const ExpectedLose = document.getElementById( `Expected Lose${index}`).innerHTML;


    console.log(actualPrice1 );

      if(!Ticker1 || Ticker1===''){
        setShowAlertPrice(true)
        return
      }
    
      if(!price1 ){
        setShowAlertPrice(true)
        return
      }

      if(!Quantity1 || Ticker1===0){
        setShowAlertPrice(true)
        return
      }

      if(stopLose1>0){
        if(buySellStatus==='Buy'){
          if(stopLose1>price1){
            setShowAlertQuantity(true)
            return
          }
        }

        else if(buySellStatus==='Sell'){
          if(stopLose1<price1){
            setShowAlertQuantity1(true)
            return
          }
        }


      }


      if(exitPrice1>0){
        if(buySellStatus==='Buy'){
          if(exitPrice1<price1){
            setShowAlertQuantity3(true)
            return
          }
        }

        if(buySellStatus==='Sell'){
          if(exitPrice1>price1){
            setShowAlertQuantity4(true)
            return
          }
        }
      }

      props.addTickers(Ticker, Quantity, price, exitPrice, stopLose,totalCost,ExpectedProfit,ExpectedLose,actualPrice,props.index);
    
      setTicker('');
      setQuantity(0);
      setPrice(0);
      setExitPrice(0);
      setStopLose(0);
      setActualPrice(0)
      setbuySellStatus('Buy')

    }



  };
  
  


  const [showAlertPrice, setShowAlertPrice] = useState(false);
  const[showAlertQuantity,setShowAlertQuantity] = useState(false)
  const handleClosePrice = () => setShowAlertPrice(false);
  const handleShowPrice = () => setShowAlertPrice(true);
  const handleCloseQuantity = () => setShowAlertQuantity(false);
  const handleShowQuantity = () => setShowAlertQuantity(true);
  const[showAlertQuantity1,setShowAlertQuantity1] = useState(false)
  const handleCloseQuantity1 = () => setShowAlertQuantity1(false);
  const handleShowQuantity1 = () => setShowAlertQuantity1(true);
  const[showAlertQuantity3,setShowAlertQuantity3] = useState(false)
  const handleCloseQuantity3 = () => setShowAlertQuantity3(false);
  const handleShowQuantity3 = () => setShowAlertQuantity3(true);
  const[showAlertQuantity4,setShowAlertQuantity4] = useState(false)
  const handleCloseQuantity4 = () => setShowAlertQuantity4(false);
  const handleShowQuantity4 = () => setShowAlertQuantity4(true);


  const Logout = async () => {
    try {
      const response = await fetch('/logout', {
        method: 'GET'
      });

      if (response.ok) {
        Cookies.remove('currentUser'); // מחיקת ה-Cookie
        localStorage.removeItem('isUserLoggedIn');
        localStorage.removeItem('userNameLogin');
        nav('/');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };
   




    //expectedProfit
    const showExpected=(val)=>{

      let str='0';

      if(val>0){

        str=`${Math.round(val).toLocaleString()}`
      }
      else if(val<0){

        str='null'

      }

      return str

    }
  
  
    
    //function for delete all
    const [showConfirmModal, setShowConfirmModal] = useState(false);

  const deleteAll = () => {
    setShowConfirmModal(true);
  };

  const handleDeleteAllConfirmed = () => {
    props.deleteAll(props.id, true);
    setShowConfirmModal(false);
  };

  const handleDeleteAllCancelled = () => {
    setShowConfirmModal(false);
  };


  


    
  return (
    <div id='divTble'>


<Modal show={showConfirmModal} onHide={handleDeleteAllCancelled} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
              Are you sure you want to delete all rows?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button style={{marginRight:'20px',color:'white', backgroundColor:'#2a9df4', border:'none' , borderRadius:'5px',padding:'5px',fontSize: '18px', fontWeight: 'bold',width:'60px'}}  variant="danger" onClick={handleDeleteAllConfirmed} >
                Yes
              </button>
              <button style={{color:'white', backgroundColor:'#2a9df4', border:'none' , borderRadius:'5px',padding:'5px',fontSize: '18px', fontWeight: 'bold'}} variant="secondary" onClick={handleDeleteAllCancelled} >
                Cancel
              </button>
            </div>
          </div>
        </Modal.Body>
      </Modal>


{ showAlertPrice && ( <>


<Modal show={showAlertPrice} onHide={handleClosePrice} className="custom-modal" backdropClassName="custom-backdrop">
<Modal.Header closeButton>
<Modal.Title id='titMidel'>Missing information!</Modal.Title>
</Modal.Header>
<Modal.Body>
<p style={{color:'red',textAlign:'center',fontWeight:"bold"}}>Please fill in the fields:Ticker,Quantity,Ask Price</p>
</Modal.Body>
<Modal.Footer>
<Button id="btnpop" variant="secondary" onClick={handleClosePrice}>
 Close
</Button>
</Modal.Footer>
</Modal>

</>

)}

{ showAlertQuantity && ( <>


<Modal show={showAlertQuantity} onHide={handleCloseQuantity} className="custom-modal" backdropClassName="custom-backdrop">
<Modal.Header closeButton>
<Modal.Title id='titMidel'>Missing information!</Modal.Title>
</Modal.Header>
<Modal.Body>
<p style={{color:'red',textAlign:'center',fontWeight:"bold"}}>Stop Lose must be lower then "Ask Price"</p>
</Modal.Body>
<Modal.Footer>
<Button id="btnpop" variant="secondary" onClick={handleCloseQuantity}>
 Close
</Button>
</Modal.Footer>
</Modal>

</>

)}

{ showAlertQuantity1 && ( <>


<Modal show={showAlertQuantity1} onHide={handleCloseQuantity1} className="custom-modal" backdropClassName="custom-backdrop">
<Modal.Header closeButton>
<Modal.Title id='titMidel'>Missing information!</Modal.Title>
</Modal.Header>
<Modal.Body>
<p style={{color:'red',textAlign:'center',fontWeight:"bold"}}>Stop Lose must be greater then "Ask Price"</p>
</Modal.Body>
<Modal.Footer>
<Button id="btnpop" variant="secondary" onClick={handleCloseQuantity1}>
 Close
</Button>
</Modal.Footer>
</Modal>

</>

)}

{ showAlertQuantity3 && ( <>


<Modal show={showAlertQuantity3} onHide={handleCloseQuantity3} className="custom-modal" backdropClassName="custom-backdrop">
<Modal.Header closeButton>
<Modal.Title id='titMidel'>Missing information!</Modal.Title>
</Modal.Header>
<Modal.Body>
<p style={{color:'red',textAlign:'center',fontWeight:"bold"}}>Exit Price must be greater then "Ask Price"</p>
</Modal.Body>
<Modal.Footer>
<Button id="btnpop" variant="secondary" onClick={handleCloseQuantity3}>
 Close
</Button>
</Modal.Footer>
</Modal>

</>

)}

{ showAlertQuantity4 && ( <>


<Modal show={showAlertQuantity4} onHide={handleCloseQuantity4} className="custom-modal" backdropClassName="custom-backdrop">
<Modal.Header closeButton>
<Modal.Title id='titMidel'>Missing information!</Modal.Title>
</Modal.Header>
<Modal.Body>
<p style={{color:'red',textAlign:'center',fontWeight:"bold"}}>Exit Price must be lower then "Ask Price"</p>
</Modal.Body>
<Modal.Footer>
<Button id="btnpop" variant="secondary" onClick={handleCloseQuantity4}>
 Close
</Button>
</Modal.Footer>
</Modal>

</>

)}


      <div id='titleDiv'>
      <h1 id='h1Title' style={{color:'aquamarine'}}>PLAN YOUR TRADE FOR FREE </h1> 
      <h2 id='h2Title' style={{color:'aquamarine'}}>(Beta Version)</h2>
      <h2 id='h2Title' style={{color:'aquamarine'}}>Quick Profit / Loss Calculator:</h2>
     </div>

     <br />

   <table id='table'>
<thead>
<tr >
<th >Ticker</th>
<th >Long/Short</th>
<th >Quantity</th>
<th>Actual Price</th>
<th >Ask Price</th>
<th >Total Cost</th>
<th >Exit Price</th>
<th >Expected Profit</th>
<th >Stop Loss</th>
<th >Expected Loss</th>
<th></th>

</tr>
</thead>

<tbody>
{props.Tickers.map((val,index)=>{
  return <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'white' : 'whitesmoke' }}>
  <td title='Enter Ticker'><input maxLength={6} id={`Ticker${index}`} style={{textTransform:'uppercase',position:'relative',top:'9px',width:'60px'}}  onChange={(e) => { handleChange(index, 'Ticker', e.target.value) }} type="text" onInput={(e)=>{e.target.value = e.target.value.replace(/[^A-Za-z@.]/g, '');}} /></td>
  <td title='Click Buy Or Sell '>
        <button id={`Long${index}`}  onClick={() => { chengeColor(index, 'Buy'); buyAndSell(index, 'Buy') }}  style={{ backgroundColor: chengeConditoin[index] === 'Buy' || !chengeConditoin[index] ? 'green' : 'gray', color: 'white',borderRadius:'10px',margin:'3px'}}>Long</button>
        <button id={`Short${index}`} onClick={() => { chengeColor(index, 'Sell'); buyAndSell(index, 'Sell') }}  style={{ backgroundColor: chengeConditoin[index] === 'Sell' ? 'red' : 'gray', color: 'white',borderRadius:'10px' }}>Short</button>
      </td>
  <td title='Enter Quantity'><input   onKeyDown={(e) => {if (e.key === 'e' || e.key === 'E') { e.preventDefault(); }}} id={`quantity${index}`}   onChange={(e) => { handleChange(index, 'Quantity', e.target.value) }} type="number" onInput={(e)=>{e.target.value = e.target.value.replace(/[^0-9]/g, '');}} /></td>
  <td style={{fontWeight:'bold'}} title='Price Of Ticker' id={`Actual${index}`}></td>
  <td title='Enter Price'><input  onKeyDown={(e) => {if (e.key === 'e' || e.key === 'E') { e.preventDefault(); }}} id={`price${index}`}  onChange={(e) => { handleChange(index, 'price', e.target.value) }} type="text" onInput={(e)=>{e.target.value = e.target.value.replace(/[^0-9.]/g, '');}} style={{position:'relative',top:'10px'}}/></td>
  <td title='Total Cost' style={{fontWeight:'bold'}} id={`'totalCost'${index}`}>${Math.round(val.TotalCost).toLocaleString()}</td>
  <td title='Enter Exit Price'><input id={`exit${index}`}  onKeyDown={(e) => {if (e.key === 'e' || e.key === 'E') { e.preventDefault(); }}}  onChange={(e)=>{handleChange(index,'ExitPrice' ,e.target.value)}} type="text"  onInput={(e)=>{e.target.value = e.target.value.replace(/[^0-9.]/g, '');}} style={{position:'relative',top:'10px'}}/></td>
  <td style={{ color: 'green' ,fontWeight:'bold'}} id={`Expected Profit${index}`} title='Expected Profit'>{`$${showExpected(val.ExpectedProfit)}`}</td>
  <td title='Enter Stop Lose'><input id={`stop${index}`}  onKeyDown={(e) => {if (e.key === 'e' || e.key === 'E') { e.preventDefault(); }}}  onChange={(e) => {handleChange(index,'stopLose',e.target.value)}} type="text"  onInput={(e)=>{e.target.value = e.target.value.replace(/[^0-9.]/g, '');}} style={{position:'relative',top:'10px'}}/></td>
  <td  style={{ color: 'red' }} id={`Expected Lose${index}`} title='Expected Lose'>-${Math.round(val.ExpectedLose).toLocaleString()}</td>

  <td id='clearbtn'>
{props.Tickers.length === 1 ? (
  <button id={`clear${index}`} onClick={()=>{clearButton(props.email,index)}} style={{borderRadius:'10px',backgroundColor:'rgb(20, 255, 255)' }}>Clear</button>
) : (
  <button id={`clear${index}`} onClick={()=>{props.delRow(props.id,index)}} style={{borderRadius:'10px',backgroundColor:'rgb(20, 255, 255)' }}>Delete</button>
)}
</td>
</tr>
})}   </tbody>     
        </table>  

        <br />

        
        
        <button id='button' onClick={() =>{inputes(props.row)} }> + Add another ticker</button>
<br />        
<br />
   <div id='divButton'>
    <button id='saveBtn' onClick={()=>{props.saveData()}}>Save All</button> 
    <button  id='delBtn' onClick={()=>{deleteAll()}}>Delete All</button> 
   </div>

   <br /><br />

<div id='divsTotal'>
<h4 style={{color:'blue', fontWeight: 'bold' }}>Total investment : ${Math.round(sumCost).toLocaleString()}</h4>
<h4 style={{ color: 'green', fontWeight: 'bold' }}>Total Profit : {`$${showExpected(sumProfit).toLocaleString()}`}</h4>
<h4 style={{ color: 'green', fontWeight: 'bold' }}>Total Profit : {`${presProfit}%`}</h4>
<h4 style={{ color: 'red', fontWeight: 'bold' }}>Total Loss : -${Math.round(sumLose).toLocaleString()}</h4>
<h4 style={{ color: 'red', fontWeight: 'bold' }}>Total Loss : {`${Math.round(presLose)}%`}</h4>
</div>
             

<button id='logout' onClick={Logout} >Log Out</button>

    </div>
  )
}

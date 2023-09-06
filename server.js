const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const db = require('mongoose');
const path = require('path')
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
app.use(express.json());
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');


app.use(express.static('build'))
db.connect('mongodb+srv://amrankh:amran123456789@cluster0.h1zeroj.mongodb.net/TickersList123').then(()=>{
    console.log('db on!!');
})




const defaultRow = {
  Ticker: '',
  Quantity:0,
  price:0,
  actualPrice:0,
  ExitPrice:0,
  StopLose: 0,
  TotalCost: '',
  ExpectedProfit: '',
  ExpectedLose:''
};

const usersShema = db.Schema({
password:String,
repetPassword:String,
email:String,
id:String,
Tickers:[{Ticker:String,
  Quantity:Number,
  price:Number,
  actualPrice:Number,
  ExitPrice:Number,
  StopLose:Number,
  TotalCost:String,
  ExpectedProfit:String,
  ExpectedLose:String}]
})



const tickersShema = db.Schema ({
  Ticker:String,
  Quantity:Number,
  price:Number,
  ActualPice:Number,
  ExitPrice:Number,
  StopLose:Number,
  TotalCost:Number,
  ExpectedProfit:Number,
  ExpectedLose:Number

})

usersShema.methods.validPassword = function(password) {
return this.password === password;
};

const usersList= db.model('userList',usersShema)


const TickersList = db.model('tickerList',tickersShema)

/*app.post('/reset-password', async (req, res) => {
const { userName, newPassword ,repetPassword} = req.body;

try {
  const updatedUser = await usersList.findOneAndUpdate(
    { userName: userName },
    { password: newPassword },
    { repetPassword: repetPassword},
    { new: true }
  );

  if (!updatedUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ message:'Password successfully updated' });
} catch (error) {
  console.error('Error updating password:', error);
  res.status(500).json({ error: 'Error updating password' });
}
});*/
const url ='https://financeproject-f5798c7b8002.herokuapp.com/resetPassword'



function sendResetEmail(email, resetCode) {

  app.post('/reset-password', async (req, res) => {
    const {  newPassword ,repetPassword} = req.body;
    
    try {
      const updatedUser = await usersList.findOneAndUpdate(
        { email:email },
        { password: newPassword },
        { repetPassword: repetPassword},
        { new: true }
      );
    
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }
    
      res.json({ message:'Password successfully updated' });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ error: 'Error updating password' });
    }
    });
// יצירת אובייקט transporter עם הגדרות נתוני הגישה לשליחת האימייל
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'financeforget32@gmail.com',
    pass: 'osyvvozntguhbdkz',
  },
});

// יצירת אובייקט mailOptions עם פרטי האימייל (נמען, נושא, גוף ההודעה וכו')
const mailOptions = {
  from: 'financeforget32@gmail.com',
  to: email,
  subject: 'password reset',
  text: `Click on the following link to reset the password ${url}`,
};

// שליחת האימייל עם הפרטים המוגדרים
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error sending email:', error);
    // טיפול בשגיאה במידת הצורך
  } else {
    console.log('Email sent successfully:', info.response);
    // התייחסות לשליחת האימייל במידת הצורך
  }
});
}
app.post('/send-reset-email', (req, res) => {
// קבלת האימייל מהבקשה
const { email } = req.body;

// ביצוע הלוגיקה של שליחת האימייל עם ספק של שרת המייל שלך (כמו Nodemailer)
sendResetEmail(email);

// מענה ללקוח עם הודעה שהאימייל נשלח
res.json({ message: 'האימייל נשלח בהצלחה' });
});











//מוסיף משתמש לדטה בייס
app.post('/addUser', async (req, res) => {
const temp = req.body.user;

const addUser = async (userData) => {
  try {
    const existingUser = await usersList.findOne({ userName: temp.email }).exec();
    if (existingUser) {
      
    } else {
      await usersList.insertMany(userData);
      res.cookie('user', userData.email); // שמירת מידע בעוגיה עם שם המשתמש
      res.json({ msg: 'User added' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to add user' });
  }
};

addUser(temp);
});


app.get('/getData', (req, res) => {

  const getData = async () => {
      let result = await usersList.find()
      res.json(result)

  }
  getData()

})

app.get('/getUserByEmail/:email', (req, res) => {
const userEmail = req.params.email;

usersList.findOne({ email: userEmail })
  .then((user) => {
    if (user) {
      res.status(200).json({ user });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  })
  .catch((error) => {
    res.status(500).json({ error: 'Database error' });
  });
});
app.post('/addUserGoogle', async (req, res) => {
try {
  const { id, email } = req.body;

  // Check if the user already exists in the database
  const existingUser = await usersList.findOne({ email });

  if (existingUser) {
    res.status(400).json({ error: 'User already exists' });
  } else {
    // Create a new user document in the database
    const newUser = new usersList({ id, email });
    await newUser.save();

    // Return the newly created user document
    res.json(newUser);
  }
} catch (error) {
  console.error('Failed to add user to the database:', error);
  res.status(500).json({ error: 'Failed to add user' });
}
});



//מוחק את כל השורות בטבלה מהדטבייס=
/*app.delete('/deleteAll/:username', async (req, res) => {
const username = req.params.username;

try {
  const user = await usersList.findOne({ userName: username });
  if (user) {
    user.Tickers = [defaultRow]; // empty the Tickers array
    await user.save();
    res.json({ message: `All Tickers for user ${username} deleted` });
  } else {
    res.json({ message: `User ${username} not found` });
  }
} catch (err) {
  console.error(err);
  res.json({ message: 'Error deleting Tickers' });
}
});*/

app.delete('/deleteAll/:username', async (req, res) => {
  const username = req.params.username;

  try {
    const user = await usersList.findOne({ id: username });
    if (!user) {
      return res.json({ message: `User ${username} not found` });
    }

    user.Tickers = [defaultRow]; // empty the Tickers array
    await user.save();
    res.json({ message: `All Tickers for user ${username} deleted` });
  } catch (err) {
    console.error(err);
    res.json({ message: 'Error deleting Tickers' });
  }
});


//מוחק שורה מהטבלה לפי אינדקס של משתמש ושל שורה
app.delete('/delRows/users/:username/rows/:rowIndex', async (req, res) => {
const username = req.params.username;
const rowIndex = parseInt(req.params.rowIndex);

try {
  const user = await usersList.findOne({ id: username });
  if (user && rowIndex >= 0 && rowIndex < user.Tickers.length) {
    user.Tickers.splice(rowIndex, 1); // delete the specific row
    if (user.Tickers.length === 0) { // if no rows left, add a default one
      user.Tickers.push(defaultRow);
    }
    await user.save();
    res.json({ message: `Row ${rowIndex} for user ${username} deleted` });
  } else {
    res.json({ message: `Row index ${rowIndex} not found for user ${username}` });
  }
} catch (err) {
  console.error(err);
  res.json({ message: 'Error deleting row' });
}
});

app.get('/*', function (req, res) {
res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
//בודק עם המשתמש קיים במערכת
app.post('/checkUser', async (req, res) => {
const { userName, email } = req.body;

try {
  // בדיקה אם שם המשתמש כבר קיים
  const userByUserName = await usersList.findOne({ userName: userName }).exec();
  
  // בדיקה אם כתובת האימייל כבר קיימת
  const userByEmail = await usersList.findOne({ email: email }).exec();

  if (userByUserName || userByEmail) {
    res.json({ exists: true });
  } else {
    res.json({ exists: false });
  }
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ error: 'An error occurred while checking user' });
}
});


app.get('/table/:id', async (req, res) => {
const id = req.params.id;

try {
  const table = await TickersList.findById(id).exec();
  res.json(table);
} catch (err) {
  console.error(`Error: ${err}`);
  res.status(500).json({ error: 'An error occurred while fetching data' });
}
});

const authenticateToken = (req, res, next) => {
const token = req.headers.authorization;

if (!token) {
  return res.sendStatus(401);
}

jwt.verify(token, 'mySecretKey', (err, user) => {
  if (err) {
    return res.sendStatus(403);
  }
  req.user = user;
  next();
});
};






// מסלול להתחברות משתמש
app.post('/signin', async (req, res) => {
const { email, password } = req.body;

try {
  const user = await usersList.findOne({ email: email});

  /*if (!user) {
    return 
  }

  const passwordMatch = await user.validPassword(password);

  if (!passwordMatch) {
    return 
  }*/

  const userId = user.id; // נגישות ל־id הייחודי של 
  const userN=user.email;
  const passw=user.password;

  return res.json({ success: true, user: { id: userId ,name:userN,pass:passw }});
} catch (error) {
  console.error('An error occurred:', error);
  return res.json({ success: false});
}
});
// מסלול מוגן על ידי הטוקן
app.get('/protected', authenticateToken, (req, res) => {
// הקוד שלך כאן...
res.json({ message: 'Protected route' });
});





const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'financeforget32@gmail.com',
    pass: 'osyvvozntguhbdkz',
  },
});

// פונקציה לשליחת הודעת ברכה
function sendWelcomeEmail(email) {

  
  //const link = `http://localhost:3000/registration-success`;

    const timestamp = Date.now();
  const link = `https://financeproject-f5798c7b8002.herokuapp.com/registration-success?timestamp=${timestamp}`;

  const mailOptions = {
    from:'financeforget32@gmail.com',
    to: email,
    subject: 'Welcome!',
    html: `
    <p>Hello and welcome to PLAN YOUR TRADE FOR FREE!</p>
    <p>we are happy to have you on board</p>
    <p>please click on the <a href="${link}">link</a> to complete your registration</p>
  `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent successfully:', info.response);
    }
  });
}



app.post('/checkUserExists', async (req, res) => {
const {email } = req.body;

try {
  const user = await usersList.findOne({ email }).exec();

  if (user) {
    res.json({ exists: true });
  } else {
    sendWelcomeEmail(email)
    res.json({ exists: false });
  }
} catch (error) {
  console.error('Failed to check user:', error);
  res.status(500).json({ error: 'Failed to check user' });
}
});





//מוסיף Ticker לא משתמש בנפרד
/*app.post('/addTicker', async (req, res) => {
const { email, ticker } = req.body;

try {
  const user = await usersList.findOneAndUpdate(
    { email: email }, // find a document with that filter
    {Tickers:ticker},
    { $push: { Tickers: defaultRow } },
    { new: true } // return the updated document
  );
  
  if (!user) {
    res.status(404).json({ error: 'User not found' });
  } else {
    res.json(user);
  }
} catch (error) {
  res.status(500).json({ error: 'Failed to add ticker' });
}
});*/


app.post('/addTicker', async (req, res) => {
  const { email, ticker } = req.body;

  try {
    const user = await usersList.findOne({ email: email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Assuming you have a schema for usersList with a Tickers field
    user.Tickers=[...ticker]; // Add the new tickers to the existing array
    user.Tickers.push(defaultRow)

    await user.save(); // Save the updated user with the new tickers

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add ticker' });
  }
});




  app.get('/logout', (req, res) => {
    req.session.destroy(err => {
      if(err) {
        return res.redirect('/');
      }
  
      res.clearCookie('connect.sid'); // 'connect.sid' is the default name of the cookie session.
      res.redirect('/login');
    });
  });
  app.get('/logout', (req, res) => {
    req.session.destroy(err => {
      if(err) {
        return res.redirect('/');
      }
  
      res.clearCookie('connect.sid'); // 'connect.sid' is the default name of the cookie session.
      res.redirect('/login');
    });
  });

  



 
// מסלול הרשמה

  app.post('/delAllTicker',(req,res)=>{
    let temp = req.body.delAllTicker
    const delArr = async (t)=>{
        await TickersList.findOneAndDelete(t)
        res.json({msg:'Arr deleted'})
    }
    delArr(temp)
})

app.post('/clearTable', (req, res) => {
  console.log("Received clearTableAfterInterval request at", req.body.time);


  res.json({ message: 'Table cleared' });
});



const port = process.env.PORT || 3000; 

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
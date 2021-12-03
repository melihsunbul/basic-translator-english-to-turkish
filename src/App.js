import React, { useState, useEffect } from "react";

import classes from './App.module.scss';
import MicIcon from '@material-ui/icons/Mic';
import StopIcon from '@material-ui/icons/Stop';

import Container from './components/UI/Container';
import Button from './components/UI/Button';
import HistoryTable from './components/History/HistoryTable';


const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const speechRecognition = new SpeechRecognition();
const FROM_LANG = 'en';
const TO_LANG = 'tr'
const API_KEY = "AIzaSyD11ylXgBEAvMeaSYU1DFULsFZJmiRU1Dc";

speechRecognition.continuous = true;
speechRecognition.interimResults = true;
speechRecognition.lang = "en-US"


function App() {
  const [interim_transcript, setInterimTranscript] = useState(''); //transcript for continuous speech
  const [final_transcript, setFinalTranscript] = useState(''); //transcript for stopped speech
  const [text, setText] = useState(''); //user text input for translation
  const [translation, setTranslation] = useState(''); //translation data get from Google API

  const [translateSession, setTranslateSession] = useState([]); //to handle delete and update content
                                                                //inside the English Box
  const [history, setHistory] = useState([]); //stores translation history
  
  const [isMicOpen, setIsMicOpen] = useState(false); //controls mic on/off
  const [feedback, setFeedback] = useState('Mic off'); //shows mic state

  //gets existing history data from local storage at the first load
  useEffect(() => {
    const initHistory = JSON.parse(localStorage.getItem('history')) || [];
    if (initHistory.length > 0 ) {
      setHistory([...initHistory]);
    }
  }, []);

  async function translationHandler(transcript) {

    const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}&q=${transcript}&source=${FROM_LANG}&target=${TO_LANG}`;
    await fetch(url, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      }
    })
      .then(res => res.json())
      .then((response) => {
        setTranslation(response.data.translations[0].translatedText);
      })
      .catch(error => {
        console.log(error);
      });

  };

  //handles voice and hand mix input 
  function inputHandler(event) {
    if (event.target.innerText.trim() === "" || event.target.innerText.trim() === " ") {
      setHistory([...history, translateSession[0]]);
      
      //when English box emptied adds latest translation data to local storage
      const arrHistory = JSON.parse(localStorage.getItem('history')) || [];
      arrHistory.push(translateSession[0])
      localStorage.setItem("history", JSON.stringify(arrHistory));

      setText("");
      translationHandler("");
    } else {
      setText(() => event.target.innerText);
      //sends request to API with mixed data
      translationHandler(text);
    }
  }

  //handles current input inside the English box to check 
  //current text for translation history
  function keyDownHandler(event) {
    //looks for backspace click
    if (event.keyCode === 8) {

      const today = new Date();
      const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
      const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      const dateTime = date + ' ' + time;
      
      let tempObj = { source: event.target.innerText, translation: translation, time: dateTime};
      setTranslateSession([...translateSession, tempObj])
    } else {
      setTranslateSession([]);
    }
  }
  
  function startSpeech() {
    speechRecognition.start();
    setText("");
    setFinalTranscript("");
    setTranslation("");

    setIsMicOpen(true);
    speechRecognition.onstart = () => {
      setFeedback("Listening...")
    };
  }
  function stopSpeech() {
    speechRecognition.stop();
    setIsMicOpen(false);
    speechRecognition.onend = () => {
      setFeedback("Mic off")
    };
  }

  speechRecognition.onresult = (event) => {
    setInterimTranscript("");
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        setFinalTranscript(function (prevValue) {
          let newFinalTranscript = prevValue += event.results[i][0].transcript;
          translationHandler(newFinalTranscript);
          return newFinalTranscript;
        })
      } else {
        setInterimTranscript(function (prevValue) {
          return prevValue += event.results[i][0].transcript;;
        })
      }

    }

  }
  return (
    <div className={classes.App}>
      <div className={classes.outerContainer}>
        <Container>
          <h3>English</h3>
          <div style={{ display: interim_transcript === "" ? 'none' : 'block' }}
            className={classes.interim}>
            {final_transcript + interim_transcript}
          </div>
          <div style={{ display: interim_transcript !== "" ? 'none' : 'block' }}
            onInput={inputHandler}
            onKeyDown={keyDownHandler}
            contentEditable={isMicOpen ? false : true}
            suppressContentEditableWarning={true}
            className={classes.final}>
              {final_transcript}
          </div>
        </Container>
        <Container>
        <h3>Turkish</h3>
          {translation}
        </Container>
      </div>
      <div className={classes.micBtn}>
        <Button onClick={isMicOpen ? stopSpeech : startSpeech}>{isMicOpen ? <StopIcon/> : <MicIcon/>}</Button>
        <p style={{ color: isMicOpen ? 'green' : 'red' }}>{feedback}</p>
      </div>
      <React.Fragment>
        <h3>Translation History</h3>
        <HistoryTable items={ history }/>
      </React.Fragment>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { Button, Tooltip, message } from 'antd';
import { AudioOutlined, AudioMutedOutlined, LoadingOutlined } from '@ant-design/icons';

const VoiceInput = ({ onSpeechEnd, targetField }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.lang = 'vi-VN';
      recognitionInstance.interimResults = false;
      recognitionInstance.maxAlternatives = 1;

      recognitionInstance.onresult = (event) => {
        const speechToText = event.results[0][0].transcript;
        onSpeechEnd(speechToText);
        setIsListening(false);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          message.error('Vui lÃ²ng cáº¥p quyá»n truy cáº­p Micro Ä‘á»ƒ sá»­ dá»¥ng tÃ­nh nÄƒng nÃ y.');
        } else {
          message.error('Lá»—i nháº­n diá»‡n giá»ng nÃ³i: ' + event.error);
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, [onSpeechEnd]);

  const toggleListening = () => {
    if (!recognition) {
      message.error('TrÃ¬nh duyá»‡t cá»§a báº¡n khÃ´ng há»— trá»£ nháº­n diá»‡n giá»ng nÃ³i (Web Speech API).');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
      setIsListening(true);
      message.info(`Äang láº¯ng nghe giá»ng nÃ³i cho trÆ°á»ng "${targetField}"...`);
    }
  };

  return (
    <Tooltip title={isListening ? 'Dá»«ng láº¯ng nghe' : 'Nháº­p liá»‡u báº±ng giá»ng nÃ³i (Tiáº¿ng Viá»‡t)'}>
      <Button 
        type={isListening ? 'primary' : 'default'}
        shape="circle" 
        icon={isListening ? <LoadingOutlined /> : <AudioOutlined />} 
        onClick={toggleListening}
        danger={isListening}
        className={isListening ? 'animate-pulse' : ''}
        size="small"
      />
    </Tooltip>
  );
};

export default VoiceInput;


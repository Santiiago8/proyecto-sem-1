import Voice, {
    SpeechErrorEvent,
    SpeechResultsEvent,
}from '@react-native-voice/voice'
import { useCallback, useEffect, useState } from 'react';

interface IState {
    recognized: string;
    pitch: string;
    error: string;
    started: string;
    results: string[];
    partialResults: string[];
    isRecording: boolean;
}

export const useVoiceRecognition = () => {
    const [state, setState] = useState<IState>({
        recognized: "",
        pitch: "",
        error: "",
        started: "",
        results: [],
        partialResults: [],
        isRecording: false,
    });

    const resetState = useCallback(() => {
        setState({
            recognized: "",
            pitch: "",
            error: "",
            started: "",
            results: [],
            partialResults: [],
            isRecording: false,
        });
    },[setState])

    const startRecognizing = useCallback( async () => {
        resetState();
        try {
            await Voice.start("es-ES");
        } catch (e) {
            console.log(e);
        }
    },[resetState])

    const stopRecognizing = useCallback( async () => {
        try {
            await Voice.stop();
        } catch (e) {
            console.log(e);
        }
    },[]);

    const cancelRecognizing = useCallback( async () => {
        try {
            await Voice.cancel();
        } catch (e) {
            console.log(e);
        }
    },[]);

    const destroyRecognizer = useCallback( async () => {
        try {
            await Voice.cancel();
        } catch (e) {
            console.log(e);
        }
        resetState()
    },[resetState]);

    useEffect(() => {
        Voice.onSpeechStart = (e:any) => {
            setState((prevState) => ({
                ...prevState,
                started: "true",
                isRecording: true,
            }));
        };

        Voice.onSpeechRecognized = () => {
            setState((prevState) => ({...prevState, recognized: 'true'}));
        };

        Voice.onSpeechEnd = (e:any) => {
            setState((prevState) => ({
                ...prevState, 
                end: 'true',
                isRecording: false,
            }));
        };

        Voice.onSpeechError = (e:SpeechErrorEvent) => {
            setState((prevState) => ({
                ...prevState,
                error: JSON.stringify(e.error),
                isRecording: false,
            }));
        };

        Voice.onSpeechResults = (e:SpeechResultsEvent) => {
            if (e.value) {
                setState((prevState) => ({...prevState, results: e.value!}));
            };
        };

        Voice.onSpeechPartialResults = (e: SpeechResultsEvent) => {
            if (e.value){
                setState((prevState) => ({...prevState, partialResults: e.value!}));
            };
        };

        Voice.onSpeechVolumeChanged = (e:any) => {
            setState((prevState) => ({...prevState, pitch: e.value}));
        };

        return () => {
            Voice.destroy().then(Voice.removeAllListeners); 
        };

    },[]);

    return {
        state,
        setState,
        resetState,
        startRecognizing,
        stopRecognizing,
        cancelRecognizing,
        destroyRecognizer,
    };
};

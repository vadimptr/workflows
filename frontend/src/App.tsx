import { CloudDownloadOutlined, FileImageOutlined, StopOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import React from 'react';
import Webcam from "react-webcam";

import './App.css';

const videoConstraints = {
  width: 480,
  height: 480,
  facingMode: "user"
};

const useRecorder = ({webcamRef} :{
  webcamRef: React.MutableRefObject<Webcam | null>;
}) => {
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const [capturing, setCapturing] = React.useState(false);
  const [recordedChunks, setRecordedChunks] = React.useState([]);

  const handleStartCaptureClick = React.useCallback(() => {
    if (webcamRef.current?.stream) {
      setCapturing(true);
      mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
        mimeType: "video/webm"
      });
      mediaRecorderRef.current.addEventListener(
        "dataavailable",
        handleDataAvailable
      );
      mediaRecorderRef.current.start();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webcamRef, setCapturing, mediaRecorderRef]);

  const handleDataAvailable = React.useCallback(
    ({ data }: {data: any}) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  const handleStopCaptureClick = React.useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setCapturing(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaRecorderRef, webcamRef, setCapturing]);

  const handleDownload = React.useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm"
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      // @ts-ignore
      a.style = "display: none";
      a.href = url;
      a.download = "react-webcam-stream-capture.webm";
      a.click();
      window.URL.revokeObjectURL(url);
      setRecordedChunks([]);
    }
  }, [recordedChunks]);

  const renderRecorder = () => (
    <>
      <Space>
        {capturing
          ? (
            <Button
              onClick={handleStopCaptureClick}
              icon={<StopOutlined />}
            >
              Stop Capture
            </Button>
          )
          : (
            <Button
              onClick={handleStartCaptureClick}
              icon={<VideoCameraOutlined />}
            >
              Start Capture
            </Button>
          )
        }
        {recordedChunks.length > 0 && (
          <Button
            onClick={handleDownload}
            icon={<CloudDownloadOutlined />}
          >
            Download
          </Button>
        )}
      </Space>
    </>
  )

  return [renderRecorder]
}

function App() {
  const webcamRef = React.useRef<Webcam | null>(null);
  const [renderRecorder] = useRecorder({webcamRef})

  return (
    <div className="App">
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        style={{
          width: videoConstraints.width,
          height: videoConstraints.height,
          margin: '20px',
          border: '2px solid',
        }}
      >
        {/* @ts-ignore */}
        {({ getScreenshot }) => (
          <div>
            <Button
              onClick={() => {
                const imageSrc = getScreenshot()
                console.log('imageSrc', imageSrc);
              }}
              icon={<FileImageOutlined />}
            >
              Capture photo
            </Button>
          </div>
        )}
      </Webcam>
      <div style={{margin: '20px'}}>
        {renderRecorder()}
      </div>
    </div>
  );
}

export default App;

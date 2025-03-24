import React from "react";
import Button from "../components/Button";
import TextArea from "../components/TextArea";
import canvasToImage from "canvas-to-image";
import Steganography from "../helpers/Steganography";

export default class ImageCrypt extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.steganObj = null;
    this.state = {
      isUploaded: false,
      maxCharCount: 100,
      disableTextarea: false,
      userContent: "",
      password: "",
      confirmPassword: "",
      passwordError: "",
      isLoading: false,
      progress: 0,
      processingStatus: "",
    };
  }

  onChangeFile(event) {
    event.stopPropagation();
    event.preventDefault();
    var self = this;
    var file = event.target.files[0];
    const canvas = this.canvasRef.current;
    var reader = new FileReader();
    // Reader loaded
    reader.onload = function (e) {
      const img = new Image();
      img.src = e.target.result;
      // Image loaded
      img.onload = () => {
        // Resize canvas with image
        canvas.width = img.width;
        canvas.height = img.height;
        const context = canvas.getContext("2d");
        context.drawImage(img, 0, 0); // Draw image to make it visible
        self.setState({ isLoading: true }, () => {
          self.steganObj = new Steganography(context, img); // Init your Steganography object
          let charSizeMax = self.steganObj.CalculateByteSize(); // Calculate bytes
          // Beware. We are using base64 to avoid issues with UTF8 chars. This adds up 1.37 times more size. We are calculation that
          self.setState({
            maxCharCount: Math.floor(charSizeMax / (8 * 1.37)),
            isUploaded: true,
            isLoading: false,
          });
        });
      };
    };
    reader.readAsDataURL(file);
  }

  validatePassword() {
    if (!this.state.password) {
      this.setState({ passwordError: "Password is required" });
      return false;
    }
    if (this.state.password.length < 4) {
      this.setState({ passwordError: "Password must be at least 4 characters long" });
      return false;
    }
    if (this.state.password !== this.state.confirmPassword) {
      this.setState({ passwordError: "Passwords do not match" });
      return false;
    }
    this.setState({ passwordError: "" });
    return true;
  }

  saveCanvas() {
    if (!this.validatePassword()) {
      return;
    }

    var self = this;
    self.setState({ 
      isLoading: true,
      progress: 0,
      processingStatus: "Processing image..."
    }, () => {
      // Add password to the content before hiding
      const contentWithPassword = `[PWD:${this.state.password}]${this.state.userContent}`;
      let resObj = this.steganObj.HideDataInContext(contentWithPassword);
      const canvasSave = this.canvasRef.current;
      const context = canvasSave.getContext("2d");
      
      // Process in chunks
      const chunkSize = 100;
      const totalChunks = Math.ceil(resObj.image.height / chunkSize);
      
      for (let chunk = 0; chunk < totalChunks; chunk++) {
        const startRow = chunk * chunkSize;
        const endRow = Math.min(startRow + chunkSize, resObj.image.height);
        
        for (let c = 0; c < resObj.image.width; c++) {
          for (let r = startRow; r < endRow; r++) {
            context.putImageData(new ImageData(resObj.data[c][r], 1, 1), c, r);
          }
        }
        
        // Update progress
        const progress = Math.round((chunk + 1) / totalChunks * 100);
        this.setState({ progress });
      }

      canvasToImage(canvasSave, {
        name: "ImageCrypted",
        type: "png",
        quality: 0.8,
      });

      self.setState({ 
        isLoading: false, 
        disableTextarea: true,
        processingStatus: ""
      });
    });
  }

  onTextInputChange(text) {
    this.setState({ userContent: text });
  }

  onPasswordChange(e) {
    this.setState({ 
      password: e.target.value,
      passwordError: ""
    });
  }

  onConfirmPasswordChange(e) {
    this.setState({ 
      confirmPassword: e.target.value,
      passwordError: ""
    });
  }

  render() {
    let canvasStyle = this.state.isUploaded
      ? { height: "auto" }
      : { height: "0px" };

    return (
      <div className="CryptHolder">
        <h2>Encode Image</h2>
        <p>Upload your image to hide text in it.</p>

        {this.state.isUploaded && (
          <Button
            size="big"
            text="Reupload"
            onClick={() => {
              this.upload.click();
            }}
          />
        )}
        {!this.state.isUploaded && (
          <Button
            size="big"
            text="Upload"
            onClick={() => {
              this.upload.click();
            }}
          />
        )}
        <canvas
          className="ImageCanvas"
          ref={this.canvasRef}
          style={canvasStyle}
        />
        <input
          id="fileUploadInput"
          type="file"
          accept="image/png, image/jpeg"
          ref={(ref) => (this.upload = ref)}
          style={{ display: "none" }}
          onChange={this.onChangeFile.bind(this)}
        />
        {this.state.isUploaded && (
          <div className="encryption-form">
            <div className="form-section">
              <h3>Enter your message:</h3>
              <TextArea
                isDisabled={this.state.disableTextarea}
                textMaxLength={this.state.maxCharCount}
                onInput={this.onTextInputChange.bind(this)}
              />
            </div>

            <div className="form-section">
              <div className="password-container">
                <div className="password-header">
                  <i className="fa fa-lock"></i>
                  <h3>Set Password Protection</h3>
                </div>
                <div className="password-inputs">
                  <input
                    type="password"
                    className="password-input"
                    placeholder="Enter password"
                    value={this.state.password}
                    onChange={this.onPasswordChange.bind(this)}
                    disabled={this.state.disableTextarea}
                  />
                  <input
                    type="password"
                    className="password-input"
                    placeholder="Confirm password"
                    value={this.state.confirmPassword}
                    onChange={this.onConfirmPasswordChange.bind(this)}
                    disabled={this.state.disableTextarea}
                  />
                </div>
                {this.state.passwordError && (
                  <div className="error-message">{this.state.passwordError}</div>
                )}
              </div>
            </div>

            <div className="form-section">
              <Button
                text="Download Encrypted Image"
                secondary
                onClick={() => {
                  this.saveCanvas();
                }}
                disabled={this.state.isLoading}
              />
            </div>

            {this.state.isLoading && (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <div className="loading-text">
                  {this.state.processingStatus}
                  {this.state.progress > 0 && ` (${this.state.progress}%)`}
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${this.state.progress}%` }}
                  />
                </div>
              </div>
            )}
            <subtitle>
              Large images will be automatically compressed for better performance.
            </subtitle>
          </div>
        )}
      </div>
    );
  }
}

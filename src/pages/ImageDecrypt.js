import React from "react";
import Button from "../components/Button";
import Steganography from "../helpers/Steganography";

export default class ImageDecrypt extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.steganObj = null;
    this.state = {
      isUploaded: false,
      hiddenText: "",
      password: "",
      isPasswordProtected: false,
      isPasswordCorrect: false,
      passwordError: "",
      isLoading: false,
      processingStatus: "",
      originalHiddenText: "", // Store the original text with password
    };
  }

  onChangeFile(event) {
    event.stopPropagation();
    event.preventDefault();
    var self = this;
    var file = event.target.files[0];
    const canvas = this.canvasRef.current;
    var reader = new FileReader();

    self.setState({ 
      isLoading: true,
      processingStatus: "Loading image...",
      isPasswordProtected: false,
      isPasswordCorrect: false,
      password: "",
      passwordError: ""
    });

    reader.onload = function (e) {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        try {
          canvas.width = img.width;
          canvas.height = img.height;
          const context = canvas.getContext("2d");
          context.drawImage(img, 0, 0);
          self.steganObj = new Steganography(context, img);
          let hiddenText = self.steganObj.GetHiddenContent();
          
          // Check if the content is password protected
          const passwordMatch = hiddenText.match(/^\[PWD:(.*?)\](.*)$/);
          if (passwordMatch) {
            self.setState({ 
              isPasswordProtected: true,
              originalHiddenText: hiddenText,
              hiddenText: passwordMatch[2],
              isUploaded: true,
              isLoading: false,
              processingStatus: "Image loaded. Please enter password to view content."
            });
          } else {
            self.setState({ 
              hiddenText: hiddenText,
              isUploaded: true,
              isLoading: false,
              processingStatus: ""
            });
          }
        } catch (e) {
          self.setState({ 
            haveError: true, 
            isUploaded: true,
            isLoading: false,
            processingStatus: "Error processing image"
          });
        }
      };
    };
    reader.readAsDataURL(file);
  }

  verifyPassword() {
    const { password, originalHiddenText } = this.state;
    const passwordMatch = originalHiddenText.match(/^\[PWD:(.*?)\](.*)$/);
    
    if (passwordMatch && passwordMatch[1] === password) {
      this.setState({ 
        isPasswordCorrect: true,
        passwordError: "",
        processingStatus: ""
      });
    } else {
      this.setState({ 
        passwordError: "Incorrect password. Please try again.",
        isPasswordCorrect: false
      });
    }
  }

  handlePasswordChange(e) {
    this.setState({ 
      password: e.target.value,
      passwordError: ""
    });
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.verifyPassword();
    }
  }

  replaceURLWithHTMLLinks(text) {
    //eslint-disable-next-line
    var exp =
      /(\b(https?|http|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    return { __html: text.replace(exp, "<a target='_blank' href='$1'>$1</a>") };
  }

  render() {
    let canvasStyle = this.state.isUploaded
      ? { height: "auto" }
      : { height: "0px" };

    return (
      <div className="CryptHolder">
        <h2>Decode Image</h2>
        <p>Upload your image to decode it.</p>
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
          <div className="HiddenText">
            {this.state.isPasswordProtected ? (
              <div className="password-protected-content">
                <div className="password-container">
                  <div className="password-header">
                    <i className="fa fa-lock"></i>
                    <h3>This image is password protected</h3>
                  </div>
                  <input
                    type="password"
                    className="password-input"
                    placeholder="Enter password"
                    value={this.state.password}
                    onChange={this.handlePasswordChange.bind(this)}
                    onKeyPress={this.handleKeyPress.bind(this)}
                    disabled={this.state.isPasswordCorrect}
                    autoFocus
                  />
                  {!this.state.isPasswordCorrect && (
                    <Button
                      text="Verify Password"
                      onClick={this.verifyPassword.bind(this)}
                      disabled={!this.state.password}
                    />
                  )}
                  {this.state.passwordError && (
                    <div className="error-message">{this.state.passwordError}</div>
                  )}
                </div>
                {this.state.isPasswordCorrect && (
                  <div className="decoded-content">
                    <h3>Decoded message:</h3>
                    <div
                      className="HiddenTextContainer"
                      dangerouslySetInnerHTML={this.replaceURLWithHTMLLinks(
                        this.state.hiddenText
                      )}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="decoded-content">
                <h3>Decoded message:</h3>
                <div
                  className="HiddenTextContainer"
                  dangerouslySetInnerHTML={this.replaceURLWithHTMLLinks(
                    this.state.hiddenText
                  )}
                />
              </div>
            )}
          </div>
        )}
        <Button
          text="Upload"
          size="big"
          onClick={() => {
            this.upload.click();
          }}
          disabled={this.state.isLoading}
        />
        {this.state.isLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">
              {this.state.processingStatus}
            </div>
          </div>
        )}
        <subtitle>Large images will be automatically compressed for better performance.</subtitle>
        {this.state.haveError && (
          <div className="ErrorPanel">
            Oh! Something happened. It might be because your image is corrupted
            or we messed up something. Either way, you can't use this image.
          </div>
        )}
      </div>
    );
  }
}

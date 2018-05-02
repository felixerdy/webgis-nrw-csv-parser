import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import csvtojson from "csvtojson";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      unit: "",
      source: "",
      file: ""
    };
  }
  handleClick = () => {
    const title = this.state.title;
    const unit = this.state.unit;
    const file = this.state.file;
    const source = this.state.source;

    if (title === "" || file === "") {
      //alert("Title or File should not be empty");
    } else {
      if (file.type === "text/csv") {
        this.getAsText(file, title, unit, source, data => {
          this.download(
            JSON.stringify(data),
            `${this.state.title
              .replace(/[^a-z0-9]/gi, "_")
              .toLowerCase()}.json`,
            "json"
          );
          console.log(data);
        });
      } else {
        alert("The file is no csv");
      }
    }
  };

  getAsText(fileToRead, title, unit, source, callback) {
    const reader = new FileReader();
    // Read file into memory as UTF-8
    reader.readAsText(fileToRead);
    console.log("reading file");
    // Handle errors load
    reader.onload = event => {
      const csvString = event.target.result;
      this.processData(csvString, title, unit, source, dataset => {
        console.log(dataset);
        callback(dataset);
      });
    };
    reader.onerror = this.errorHandler;
  }
  processData(csvString, title = "", unit = "", source = "", callback) {
    let header;
    const customDataset = {
      title: title,
      unit: unit,
      source: source,
      data: []
    };

    csvtojson({
      delimiter: ";"
    })
      .fromString(csvString, {
        encoding: "utf8"
      })
      .on("header", parsedHeader => {
        console.log(parsedHeader);
        header = parsedHeader;
      })
      .on("csv", csvRow => {
        // Wenn die Row mit einer Zahl beginnt..
        if (!isNaN(Number(csvRow[0]))) {
          const cityObject = {
            RS: csvRow[0],
            AGS: csvRow[0],
            GEN: csvRow[1],
            data: {}
          };

          header.forEach((element, idx) => {
            if (!isNaN(Number(element)) && element !== "") {
              cityObject.data[`${element}`] = csvRow[idx].replace(",", ".");
            }
          }, this);

          customDataset.data.push(cityObject);
        }
      })
      .on("done", () => {
        callback(customDataset);
      });
  }

  errorHandler(evt) {
    if (evt.target.error.name === "NotReadableError") {
      alert("Canno't read file !");
    }
  }

  updateTitle = e => {
    this.setState({
      title: e.target.value
    });
  };

  updateUnit = e => {
    this.setState({
      unit: e.target.value
    });
  };

  updateSource = e => {
    this.setState({
      source: e.target.value
    });
  };

  updateFile = e => {
    this.setState({
      file: e.target.files[0]
    });
  };

  // Function to download data to a file
  download(data, filename, type) {
    var file = new Blob([data], { type: type });
    if (window.navigator.msSaveOrOpenBlob)
      // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename);
    else {
      // Others
      var a = document.createElement("a"),
        url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 0);
    }
  }

  render() {
    return (
      <div className="container">
        <div className="field">
          <label className="label">Title</label>
          <div className="control">
            <input
              id="input_title"
              className="input"
              type="text"
              placeholder="Title of the Dataset"
              onChange={this.updateTitle}
            />
          </div>
        </div>

        <div className="field">
          <label className="label">Unit</label>
          <div className="control">
            <input
              id="input_unit"
              className="input"
              type="text"
              placeholder="Unit of the given Data"
              onChange={this.updateUnit}
            />
          </div>
        </div>

        <div className="field">
          <label className="label">Source</label>
          <div className="control">
            <input
              id="input_source"
              className="input"
              type="text"
              placeholder="Source of the given Data"
              onChange={this.updateSource}
            />
          </div>
        </div>

        <div className="field">
          <label className="label">CSV File</label>
          <div className="control">
            <input id="input_csv" type="file" onChange={this.updateFile} />
          </div>
        </div>

        <div className="control">
          <button
            id="submit"
            className="button is-link"
            onClick={this.handleClick}
          >
            Parse to JSON
          </button>
        </div>
      </div>
    );
  }
}

export default App;

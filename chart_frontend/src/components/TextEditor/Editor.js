
import React, { Component } from "react";
import Select from 'react-select'
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw ,convertFromHTML,ContentState} from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from "draftjs-to-html";
import { getScriptFile, getScriptFileNames, createScriptFile } from "api/Api";
import {
  Button
} from "reactstrap";

import Modal from 'react-bootstrap/Modal'

export default class TextEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editorState: EditorState.createEmpty(),
      textdata:["hello"],
      scriptfiles: [],
      scriptfile: null,
      selectedFileName: null,
      filename: '',
      file:[],
      content: null,
      isUpdate: false,
      isShowOpenModal: false,
      isShowSaveModal: false,
    };
  }
  
  handleScriptFileChange = (e) => {
    this.setState({
      selectedFileName: e,
      filename: e.value,
    });
  }

  handleScriptFileSave = async () => {
    if (!this.state.filename) {
      alert("Please input the file name!")
      return;
    }

    if (!this.state.content.length) {
      alert("File content is empty!")
      return;
    }

    const res = await createScriptFile(
      this.state.isUpdate ? this.state.selectedFileName.value : this.state.filename,
      this.state.content,
      this.state.isUpdate
    )
    if (res.success) {
      this.SaveScriptModalClose()
      return;
    }
    alert(res.message);
  }

  handleScriptFileNameChange = (e) => {
    this.setState({
      filename: e.target.value
    })
  }

  onEditorStateChange = (editorState) => {
    this.setState({
      editorState,
    });
  };

  handleScriptFileCreate = async () => {
    this.setState({
      isUpdate: false,
      scriptfiles: null,
      filename: '',
      selectedFileName: null,
      editorState: EditorState.createEmpty(),
    })
  }
  
  handleOpenScriptFile = async () => {
    const res = await getScriptFileNames();
    const files = res.strategy_files.map(file => {
      return {
        value: file.file_name,
        label: file.file_name
      }
    })
    this.setState({
      scriptfiles: files,
      selectedFileName: files[0],
      filename: files[0].value,
      isShowOpenModal: true,
      isUpdate: true,
    })
  }
  
  handleSaveModalShow = async () => {
    this.setState({isShowSaveModal: true})
  }
  
  OpenScriptModalClose = () => {
    this.setState({isShowOpenModal: false})
  }
  
  SaveScriptModalClose = () => {
    this.setState({isShowSaveModal: false})
  }

  handleScriptFileOpen = async (selectedFileName) => {
    const file = await getScriptFile(selectedFileName.value)
    const blocksFromHTML = convertFromHTML(file.file_content ? file.file_content.content : '');
    const blockContent= ContentState.createFromBlockArray(
      blocksFromHTML.contentBlocks,
      blocksFromHTML.entityMap,
    );
    this.setState({
      editorState: EditorState.createWithContent(blockContent),
      scriptfile: file.file_content,
    })
    this.OpenScriptModalClose();
  }

  handleSave = (content) => {
    this.setState({
      content,
    })
    this.handleSaveModalShow()
  }

  showFile = async (e) => {
    e.preventDefault()
    let currFile=e.target.files[0]
    const reader = new FileReader()
    reader.onload = async (e) => { 
      const text = (e.target.result)
      const blocksFromHTML = convertFromHTML(text);
      const state= ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap,
      );
      this.setState({editorState: EditorState.createWithContent(state),file:currFile})
    };
    reader.readAsText(e.target.files[0])
  }

  render() {
    const { editorState } = this.state;
    return (
      <React.Fragment>
        <div className="hunter-textedit-container" > 
          <div className="hunter-data-table-title">
            Strategy File Editor
          </div>
          <Editor
            editorState={editorState}
            toolbarClassName="toolbarClassName"
            wrapperClassName="wrapperClassName"
            editorClassName="editorClassName"
            editorStyle={{backgroundColor:"whitesmoke"}}
            onEditorStateChange={this.onEditorStateChange}
          />
          <div className="display-flex-left">
            <button className="btn btn-md btn-secondary" onClick={()=>this.handleScriptFileCreate()}>New</button>
            <button className="btn btn-md btn-secondary" onClick={()=>this.handleOpenScriptFile()}>Open</button>
            <button className="btn btn-md btn-secondary" onClick={()=>this.handleSave(draftToHtml(convertToRaw(editorState.getCurrentContent())))}>Save</button>
          </div>
          {/* {this.state.textdata.map((item, index) => <div className="container bg-dark mt-2 p-2 rounded text-light" key={index}>{ item }</div>)} */}
          <Modal show={this.state.isShowOpenModal} className="hunter-modal" onHide={this.OpenScriptModalClose}>
            <Modal.Header closeButton>
              <Modal.Title>Open Script File</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="select-multi-option">
                <label>select file name</label>
                <Select
                  name="filters"
                  placeholder="Script Files"
                  value={this.state.selectedFileName}
                  onChange={this.handleScriptFileChange}
                  options={this.state.scriptfiles}
                />
              </div>
            </Modal.Body>
            <Modal.Footer className="hunter-modal-footer">
              <Button
                variant="primary"
                className="btn-md"
                onClick = {() => {
                  this.handleScriptFileOpen(this.state.selectedFileName)
                }}
              >
                Open
              </Button>
            </Modal.Footer>
          </Modal>
          <Modal show={this.state.isShowSaveModal} className="hunter-modal" onHide={this.SaveScriptModalClose}>
            <Modal.Header closeButton>
              <Modal.Title>Save Script File</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="hunter-form-group">
                <input
                    type="text"
                    className="form-control hunter-form-control"
                    placeholder="script file name"
                    value={
                      this.state.filename
                    }
                    onChange={(e) => { this.handleScriptFileNameChange(e)}}
                />
              </div>
            </Modal.Body>
            <Modal.Footer className="hunter-modal-footer">
              <Button variant="primary" onClick={this.handleScriptFileSave} className="btn-md">
                Save
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </React.Fragment>
    );
  }
}
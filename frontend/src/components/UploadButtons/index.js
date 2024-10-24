import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Tooltip } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import PhotoCamera from '@material-ui/icons/PhotoCamera';
import HighlightOffIcon from '@material-ui/icons/HighlightOff';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  input: {
    display: 'none',
  },
}));

export default function UploadButtons({ imageFile, onImageChange, onDelete }) {
  const classes = useStyles();
  
  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      onImageChange(URL.createObjectURL(file), file); 
    }
  };

  return (
    <div className={classes.root}>
      <input
        accept="image/*"
        className={classes.input}
        id="icon-button-file"
        type="file"
        name='image'
        onChange={handleImageChange} // Associando a função de mudança
      />
      {!imageFile ? (
        <Tooltip title="Clique para adicionar sua foto de perfil" arrow>
          <label htmlFor="icon-button-file">
            <IconButton color="primary" aria-label="upload picture" component="span" size="large">
              <PhotoCamera style={{ margin: "2vh", fontSize: '6vh' }} />
            </IconButton>
          </label>
        </Tooltip>
      ) : (
        <>
          <Tooltip title="Clique para trocar a foto" arrow>
            <label htmlFor="icon-button-file">
              <IconButton color="primary" aria-label="upload picture" component="span" size="large">
                <Avatar
                  alt="foto de perfil atual"
                  src={imageFile}
                  style={{ margin: "2vh", width: '100px', height: '100px' }}
                />
              </IconButton>
            </label>
          </Tooltip>
          <Tooltip title="Deletar foto de perfil atual" arrow>
            <IconButton onClick={onDelete} style={{ margin: "2vh" }} aria-label="deletar foto de perfil">
              <HighlightOffIcon style={{ fontSize: '4vh', color: "red" }} />
            </IconButton>
          </Tooltip>
        </>
      )}
    </div>
  );
}
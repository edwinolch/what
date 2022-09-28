import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  DialogActions,
  TextField,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  Input,
  Typography,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from "@material-ui/core";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { useTranslation } from "react-i18next";
import TemplateBody from "../TemplateBody";
import EditIcon from '@material-ui/icons/Edit';
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import ButtonWithSpinner from "../ButtonWithSpinner";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },

  multFieldLine: {
    display: "flex",
  },

  btnWrapper: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },

  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },

  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },

  multFieldLine: {
		display: "flex",
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(1),
		},
		alignItems: "center",
	},
}));

const TemplatesDataModal = ({ open, onClose, templatesId }) => {
    const { i18n } = useTranslation();
    const classes = useStyles();

    const [name, setName] = useState("");
    const [footer, setFooter] = useState("");
    const [bodies, setBodies] = useState([]);
    const [selectedBody, setSelectedBody] = useState(null);
    const [selectedBodyIndex, setSelectedBodyIndex] = useState("");
    const [bodyModalOpen, setBodyModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      const fetchTemplates = async () => {
        setLoading(true);
        try {
          const { data } = await api.get(`/TemplatesData/show/${templatesId}`);
          setName(data.name);
          setFooter(data.footer);
          setBodies(JSON.parse(data.text));
          setLoading(false);
        } catch (err) {
          toastError(err);
          setLoading(false);
        }
      };
      if (templatesId) {
        fetchTemplates();
      }
    }, [templatesId, open]);

    const handleClose = () => {
      onClose();
      setName("");
      setFooter("");
      setBodies([]);
      setSelectedBody(null);
      setBodyModalOpen(false);
    };

    const handleSubmit = async () => {
      setLoading(true);
      try {
				const formData = new FormData();

				formData.set("name", name);
				formData.set("footer", footer);
      
        for (const body of bodies) {
          if ((body.type === "audio" || body.type === "video" || body.type === "image") && (typeof body.value !== 'string')) {
            formData.append("file", body.value, `${body.value.name}/${body.type}`);
          } else {
            formData.append("bodies", JSON.stringify(body));
          }
        }

        if (templatesId) {
				  await api.put(`/TemplatesData/edit/${templatesId}`, formData);
        } else {
          await api.post(`/TemplatesData/create/`, formData);
        }
        toast.success(i18n.t("templatesData.modalConfirm.successAdd"));

        setLoading(false);
			} catch (err) {
				toastError(err);
        setLoading(false);
			}

      handleClose();
    };

    const handleOpenBodyModal = () => {
      setBodyModalOpen(true);
    }

    const handleCloseBodyModal = () => {
      setSelectedBody(null);
      setSelectedBodyIndex("");
      setBodyModalOpen(false);
    }

    const handleEditBodyModal = (body, index) => {
      setSelectedBody(body);
      setSelectedBodyIndex(index);
      setBodyModalOpen(true);
    }

    const handleNameChange = (e) => {
      setName(e.target.value);
    }

    const handleFooterChange = (e) => {
      setFooter(e.target.value);
    }
    
    const handleBodiesChange = (body, index) => {
      let array = [...bodies];
      if (index || index === 0) {
        array[index] = body;
        setBodies(array);
      } else {
        array.push(body);
        setBodies(array);
      }
    }

    const handleDeleteBodyModal = (body, index) => {
      const array = [...bodies];
      array.splice(index, 1);

      setBodies(array);
    }

  return (
    <div className={classes.root}>
      <TemplateBody
        open={bodyModalOpen}
        onClose={handleCloseBodyModal}
        aria-labelledby="form-dialog-title"
        body={selectedBody}
        index={selectedBodyIndex}
        handleBodiesChange={handleBodiesChange}
      />
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {templatesId
            ? `${i18n.t("templatesData.templateModal.buttonEdit")}`
            : `${i18n.t("templatesData.templateModal.buttonAdd")}`}
        </DialogTitle>
				<DialogContent dividers>
          <div className={classes.root}>
						<FormControl
							variant="outlined"
							margin="dense"
							fullWidth
						>
							<TextField
								label="Nome"
								variant="outlined"
								value={name}
								onChange={handleNameChange}
								fullWidth
							/>
						</FormControl>
					</div>
          { bodies.length > 0 &&
            <Paper className={classes.mainPaper} variant="outlined">
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Tipo</TableCell>
                      <TableCell align="center">Body</TableCell>
                      <TableCell align="center">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <>
                      {bodies && bodies.map((body, index) => {
                        return (
                          <TableRow key={index}>
                            <TableCell align="center">{body.type}</TableCell>
                            { (body.type === "text" || body.type === "contact") &&
                              <TableCell align="center">{body.value}</TableCell>
                            }
                            { (body.type === "audio" || body.type === "video" || body.type === "image") &&
                              <TableCell align="center">{body.value.name || body.value}</TableCell>
                            }
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={() => handleEditBodyModal(body, index)}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteBodyModal(body, index)}
                              >
                                <DeleteOutlineIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                        })}
                    </>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          }
          <div className={classes.root}>
            <Button
              color="primary"
              variant="contained"
              fullWidth
              onClick={handleOpenBodyModal}
            >
              Adicionar Body
            </Button>
          </div>
          <div className={classes.root}>
						<FormControl
							variant="outlined"
							margin="dense"
							fullWidth
						>
							<TextField
								label="Footer"
								variant="outlined"
								value={footer}
								onChange={handleFooterChange}
								fullWidth
							/>
						</FormControl>
					</div>
				</DialogContent>
				<DialogActions>
          <Button
						onClick={handleClose}
						color="secondary"
						variant="outlined"
					>
						Cancelar
					</Button>
          <ButtonWithSpinner
						onClick={handleSubmit}
						color="primary"
						variant="contained"
            loading={loading}
					>
						{ templatesId ? 'Editar' : 'Criar' }
					</ButtonWithSpinner>
				</DialogActions>
			</Dialog>
    </div>
  );
};

export default TemplatesDataModal;

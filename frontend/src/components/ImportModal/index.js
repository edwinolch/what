import React, { useContext, useEffect, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { green, red } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";

import { useTranslation } from "react-i18next";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { MenuItem, Paper, Select } from "@material-ui/core";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	textField: {
		marginRight: theme.spacing(1),
		flex: 1,
	},

	extraAttr: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},

	btnWrapper: {
		position: "relative",
	},

	multFieldLine: {
		display: "flex",
		"& > *:not(:last-child)": {
			marginRight: theme.spacing(1),
		},
		marginBottom: 20,
		marginTop: 20,
		alignItems: "center",
	},

	buttonRed: {
		color: red[300],
	},

	buttonProgress: {
		color: green[500],
		position: "absolute",
		top: "50%",
		left: "50%",
		marginTop: -12,
		marginLeft: -12,
	},
}));

const ImportModal = ({ open, onClose }) => {
	const classes = useStyles();
	const { i18n } = useTranslation();
	const { user } = useContext(AuthContext);
	const { whatsApps } = useContext(WhatsAppsContext);

    const [file, setFile] = useState();
	const [selectedType, setSelectedType] = useState(true);
	const [selectedConnection, setSelectedConnection] = useState([]);
	const [loading, setLoading] = useState(false);
	const [showInfo, setShowInfo] = useState(false);
	const [openSelect, setOpenSelect] = useState(false);
	const [menus, setMenus] = useState();
	const [useType, setUseType] = useState(false);
	const [templates, setTemplates] = useState([]);
	const [selectedTemplate, setSelectedTemplate] = useState("Nenhum");

	const handleClose = () => {
		onClose();
		setFile();
	};

    const handleFile = (e) => {
		setFile(e.target.files[0])
    }

	const handleSubmit = async () => {
		setLoading(true);
		if (selectedConnection.length === 0 && !file) {
			toast.error("Por favor, selecione uma ou mais conexões e um arquivo de disparo.");
		} else if (selectedConnection.length === 0 ) {
			toast.error("Por favor, selecione uma ou mais conexões.");
		} else if (!file) {
			toast.error("Por favor, selecione um arquivo de disparo.");
		} else {
			try {
				const formData = new FormData();
				formData.append("file", file, file.name);
				formData.set("ownerid", user.id);
				formData.set("name", file.name);
				formData.set("official", selectedType);
				if (selectedConnection.includes('Todos')) {
					formData.set("whatsappIds", null);
				} else {
					const selectedConnectionToString = selectedConnection.join();
					formData.set("whatsappIds", selectedConnectionToString);
				}
				if (selectedTemplate !== "Nenhum") {
					formData.set("templateId", selectedTemplate);
				}

				await api.post("file/upload", formData);
			} catch (err) {
				toastError(err);
			}
			handleClose();
		}
		setLoading(false);
	}

	const handleChange = (e) => {
		setSelectedType(e.target.value);
	}

	const handleChangeConnection = (e) => {
		const {
			target: { value },
		} = e;

		if (value.includes('Todos')) {
			setSelectedConnection([]);

			let allConnections = ["Todos"]

			// whatsApps.map((whats => {
			// 	if (whats.official === selectedType) {
			// 		allConnections.push(whats.id);
			// 	}return null
			// }));

			setSelectedConnection(allConnections);
			setOpenSelect(false);
		} else {
			setSelectedConnection(typeof value === "string" ? value.split(",") : value);
		}
	}

	const handleChangeTemplate = (e) => {
		setSelectedTemplate(e.target.value);
	}

	const handleOpenSelect = () => {
		setOpenSelect(true)
	};

	const handleCloseSelect = () => {
		setOpenSelect(false)
	};

	useEffect(() => {
		const fetchMenus = async () => {
			try {
				const { data } = await api.get('menus/company');
				setMenus(data);
			} catch(err) {
				toastError(err);
			}
		}
		fetchMenus();
	}, [])

	useEffect(() => {
		const fetchTemplates = async () => {
			try {
				const { data } = await api.get('/TemplatesData/list/');
				setTemplates(data.templates);
			} catch (err) {
				toastError(err);
			}
		}
		fetchTemplates();
	}, [])

	useEffect(() => {
		if (menus) {
			let offWhats = false;
			let noOffWhats = false;

			menus.forEach(menu => {
				if (menu.name === "Official Connections") {
					offWhats = true;
				}

				if (menu.name === "Connections") {
					noOffWhats = true;
				}
			})

			if (offWhats && noOffWhats) {
				setUseType(true);
			}

			if (offWhats && !noOffWhats) {
				setUseType(false);
				setSelectedType(true);
			}

			if (!offWhats && noOffWhats) {
				setUseType(false);
				setSelectedType(false);
			}
		}
	}, [menus])

	return (
		<div className={classes.root}>
			<Dialog
                open={open}
                onClose={handleClose}
                maxWidth="lg"
                scroll="paper"
            >
                <DialogTitle id="form-dialog-title">
					{i18n.t('importModal.title')}
				</DialogTitle>
                <DialogContent dividers>
					{ useType && 
						<Typography variant="subtitle1" gutterBottom>
							{i18n.t('importModal.form.shotType')}:
						</Typography>
					}
					{ useType && 
					<div className={classes.multFieldLine}>
						<Select
							labelId="type-select-label"
							id="type-select"
							value={selectedType}
							label="Type"
							onChange={handleChange}
							style={{width: "100%"}}
							variant="outlined"
						>
							<MenuItem value={true}>{i18n.t('importModal.form.official')}</MenuItem>
							<MenuItem value={false}>{i18n.t('importModal.form.notOfficial')}</MenuItem>
						</Select>
					</div>
					}
					<Typography variant="subtitle1" gutterBottom>
                        Conexões:
					</Typography>
					<div className={classes.multFieldLine}>
						<Select
							variant="outlined"
							labelId="type-select-label"
							id="type-select"
							value={selectedConnection}
							label="Type"
							onChange={handleChangeConnection}
							multiple
							open={openSelect}
							onOpen={handleOpenSelect}
							onClose={handleCloseSelect}
							style={{width: "100%"}}
						>
							<MenuItem value={"Todos"}>Todos</MenuItem>
							{whatsApps && whatsApps.map((whats, index) => {
								if (whats.official === selectedType) {
									if (selectedType === false && whats.status === "CONNECTED") {
										return (
											<MenuItem key={index} value={whats.id}>{whats.name}</MenuItem>
										)
									} else if (selectedType === true) {
										return (
											<MenuItem key={index} value={whats.id}>{whats.name}</MenuItem>
										)
									}
								} return null
							})}
						</Select>
					</div>
					{ selectedType === false &&
						<Typography variant="subtitle1" gutterBottom>
							Template:
						</Typography>
					}
					{ selectedType === false &&
					<div className={classes.multFieldLine}>
						<Select
							variant="outlined"
							labelId="type-select-label"
							id="type-select"
							value={selectedTemplate}
							label="Type"
							onChange={(e) => { handleChangeTemplate(e) }}
							style={{width: "100%"}}
						>
							<MenuItem value={"Nenhum"}>Nenhum</MenuItem>
							{templates.length > 0 && templates.map((template, index) => {
								return (
									<MenuItem key={index} value={template.id}>{template.name}</MenuItem>
								)
							})}
						</Select>
					</div>
					}
					<div className={classes.multFieldLine}>
						<Button
							variant="contained"
							component="label"
						>
							{i18n.t('importModal.buttons.uploadFile')}
							<input
								type="file"
								onChange={handleFile}
								hidden
							/>
						</Button>
						<Typography variant="subtitle1" gutterBottom>
                        	{file ? `${i18n.t('importModal.form.uploadedFile')}: ${file.name}` : i18n.t('importModal.form.noFile')}
						</Typography>
					</div>
					<div className={classes.multFieldLine}>
						<Typography variant="subtitle1" gutterBottom>
							{i18n.t('importModal.form.supportedTriggerModel')}
						</Typography>
						<Button onClick={() => setShowInfo(!showInfo)}>{showInfo ? "Esconder" : "Mostrar"}
						</Button>
					</div>
					<div>
						{showInfo && (
							<Paper
								variant="outlined"
							>
								<Typography variant="subtitle1" gutterBottom>
									NOME;CPF/CNPJ;TELEFONE;TEMPLATE_WHATS;PARAMETROS_TEMPLATE;TEXTO_MENSAGEM<br /><br />
									- CAMPOS OPCIONAIS (SE TEXTO_MENSAGEM PREENCHIDO)<br />
									TEMPLATE_WHATS<br />
									PARAMETROS_TEMPLATE<br /><br />
									- CAMPOS OPCIONAIS (SE TEMPLATE_WHATS PREENCHIDO)<br />
									TEXTO_MENSAGEM<br />
									PARAMETROS_TEMPLATE<br />
								</Typography>
							</Paper>
						)}
					</div>
                </DialogContent>
				<DialogActions>
					<Button
						onClick={handleClose}
						color="secondary"
						variant="outlined"
						disabled={loading}
					>
						{i18n.t('importModal.buttons.cancel')}
					</Button>
					<Button
						type="submit"
						color="primary"
						variant="contained"
						className={classes.btnWrapper}
						onClick={handleSubmit}
						disabled={loading}
					>
						{i18n.t('importModal.buttons.import')}
					</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
};

export default ImportModal;
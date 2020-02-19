import React from 'react';
import Spinner from "../components/Spinner";
import {
	Grid,
	Card,
	CardMedia,
	CardContent,
	Typography,
	withStyles,
	Paper,
	TextField,
	Button
} from '@material-ui/core';

const styles = {
	location: {
		marginBottom: "20px"
	},
	content: {
		marginTop: "20px",
		flexGrow: 1,
		width: "100%"
	},
	paper: {
		textAlign: "center",
		padding: "10px",
		marginBottom: "20px"
	},
	filler: {
		textAlign: "center",
		padding: "150px"
	},
	comment: {
		padding: "10px",
		marginBottom: "5px"
	}
};

/**
 * Used to show the details relating to a given location
 */

class Details extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			data: "",
			comment: "",
			commentAdded: false,
			showSpinner: true
		};

		this.handleTextFieldOnChange = this.handleTextFieldOnChange.bind(this);
		this.handlePostButtonOnClick = this.handlePostButtonOnClick.bind(this);
	}

	/**
	 * Sends a GET request to /api/location/:id
	 */
	async fetchLocationDetails() {
		try {
			const resp = await fetch(`/api/location/${this.props.id}`);
			const data = await resp.json();

			this.setState({
				showSpinner: false,
				data: data
			});
		} catch (e) {
			// TODO: Error handling
			console.log(e);
		}
	}

	/**
	 * Sends a POST request to /api/location/comment
	 */
	async addCommentForLocation() {
		try {
			// Prepare the data
			const data = {
				id: this.state.data._id,
				comment: this.state.comment
			}

			const resp = await fetch("/api/location/comment", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify(data)
			});

			const modified = await resp.json();

			if (resp.status === 200 && modified === 1) {
				this.setState({
					showSpinner: true,
					commentAdded: true,
					comment: ""
				});

				this.fetchLocationDetails();
			}

			// TODO: What if the modified count is not 1? Show an alert error
		} catch (e) {
			// TODO: Error handling
			console.log(e);
		}
	}

	/**
	 * Handles the text field on change
	 * 
	 * @param {*} e 
	 */
	handleTextFieldOnChange(e) {
		this.setState({
			comment: e.target.value,
			commentAdded: false
		});
	}

	/**
	 * Handles the post button on click
	 */
	handlePostButtonOnClick() {
		this.state.comment.length > 50 ? this.addCommentForLocation() : alert("Comment not long enough!");
	}

	componentDidMount() {
		// Check that id has been passed into props and fetch the data for this location
		if (this.props.id !== undefined || this.props.id !== null) {
			this.fetchLocationDetails();
		}
	}

	render() {
		// Get the styles from makeStyles hook
		const classes = this.props.classes;

		// Check that data state is ready
		if (this.state.data !== "" || this.state.commentAdded) {
			const details = this.state.data;

			// Prepare the comments
			let comments = (
				<Paper className={classes.filler}>
					<Typography variant="body1" color="textSecondary">
						No comments
					</Typography>
				</Paper>
			);

			if (details.comments.length > 0) {
				comments = [];

				// Create a card for each of the comments
				for (const c of details.comments) {
					comments.push(
						<Paper className={classes.comment}>
							<Typography variant="caption" color="textSecondary">
								{c}
							</Typography>
						</Paper>
					)
				}
			}

			return (
				<Grid container direction="row" alignItems="center" justify="center" className={classes.content}>
					<Grid item lg={5}>
						<Card className={classes.location}>
							{details.image !== undefined ? <CardMedia component="img" height="50%" image={details.image} title={details.name}
							/> : <span></span>}
							<CardContent>
								<Typography gutterBottom variant="h3">
									{details.name}
								</Typography>
								<Typography gutterBottom variant="subtitle1">
									{details.part_of[0]}
								</Typography>
								<Typography gutterBottom variant="body1" color="textSecondary">
									{details.intro}
								</Typography>
								<Typography gutterBottom variant="subtitle2" color="textSecondary">
									Longitude: {details.loc.coordinates[0].toFixed(3)}, Latitude: {details.loc.coordinates[1].toFixed(3)} {
										details.climate !== null ? `,Temperature: ${details.climate.temperature.average_max.months[0]}` : ""
									}
								</Typography>
							</CardContent>
						</Card>

						<Paper className={classes.paper}>
							<TextField label="Been here? Leave a Comment" margin="dense" fullWidth onChange={this.handleTextFieldOnChange} value={this.state.comment} />
							<Button variant="contained" color="primary" variant="outlined" onClick={this.handlePostButtonOnClick}>
								Post
							</Button>
						</Paper>

						{comments}
					</Grid>

					{/* <Grid item xs={5}>

					</Grid> */}
				</Grid>
			)
		}

		// Check if the spinner is to be shown
		if (this.state.showSpinner) return <Spinner />;
	}
}

export default withStyles(styles)(Details);
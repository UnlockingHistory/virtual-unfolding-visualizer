# virtual-unfolding-visualizer

This is a visualization tool for verifying that the files generated by [virtual unfolding](https://github.com/UnlockingHistory/virtual-unfolding) are correct.

This app is still in progress and currently only supports viewing some of the files produced during the initial segmentation step.  Check back in the following weeks for updates.  A live version of this code is hosted at [unlockinghistory.github.io/virtual-unfolding-visualizer/](https://unlockinghistory.github.io/virtual-unfolding-visualizer/).

## Use

To use, select "Upload Files" and select folder containing Virtual Unfolding results.  Once loaded, the files will appear in the left menu.  You can select one scalar field and multiple vector fields to view in the 3D viewer.  Toggle the dropdown on each file to configure the visualization.

## Development

In the project directory run:

`npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

To deploy the app to the gh-pages branch run:

`npm run deploy`

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
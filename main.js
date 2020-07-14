const fs = require('fs');
const fetch = require('node-fetch');
const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');

const DATE = 'July 14, 2020';
const VERSION = process.env.npm_package_version;
const AUTHOR = `${process.env.npm_package_author_name} <${process.env.npm_package_author_email}>`;
const URL = 'https://github.com/jpgmoreira/cf-problemset-study';

const aboutText =
`Codeforces problemset study program.
Version: ${VERSION} (${DATE})
Author: ${AUTHOR}`;

let mainWindow;

const showDialog = ({ title = 'Message', message = '', detail = '' }) => {
	dialog.showMessageBox(mainWindow, {
		type: 'none',
		buttons: ['OK'],
		title,
		message,
		detail
	});
}

let problems = [];
const problemsetFile = 'problemset.json';
const problemsetURL = 'https://codeforces.com/api/problemset.problems';

/**
 * Sort problems by solvedCount. Most solved to least solved.
 */
const problemSort = (a, b) => {
	if (a.solvedCount < b.solvedCount)
		return 1;
	return -1;
}

const loadProblems = () => {
	if (!fs.existsSync(problemsetFile)) {
		showDialog({
			message: `"${problemsetFile}" does not exist.\nPlease click on "Download Problemset".`
		});
		return;
	}
	const problemset = JSON.parse(fs.readFileSync(problemsetFile));
	problems = problemset.result.problems;
	const problemStatistics = problemset.result.problemStatistics;
	/**
	 * Preprocess problems array.
	 */
	let unrated = 0;
	for (let i = 0; i < problems.length; i++) {
		if (!problems[i].contestId)
			problems[i].contestId = problemStatistics[i].contestId;
		if (!problems[i].index)
			problems[i].index = problemStatistics[i].index;
		if (problems[i].rating === undefined)
			unrated++;
		problems[i].solvedCount = problemStatistics[i].solvedCount;
	}
	problems.sort(problemSort);
	for (let i = 0; i < problems.length; i++) {
		problems[i].page = ( Math.floor(i / 100.0) + 1 );
	}
	console.log('> Number of unrated problems:', unrated);
	console.log('> Most solved problem:', problems[0]);
}

let downloading = false;
const downloadProblemset = () => {
	if (downloading) 
		return;
	downloading = true;
	fetch(problemsetURL)
	.then(res => res.json())
	.then((json) => {
		fs.writeFileSync(problemsetFile, JSON.stringify(json));
		loadProblems();
		showDialog({
			message: 'Problemset downloaded.'
		});
		downloading = false;
	})
	.catch((e) => {
		showDialog({
			message: `Unable to download Codeforces problemset. You may try to download it manually from:\n"${problemsetURL}".`}
		);
		downloading = false;
	});
}

/** -------------------------------------------------- */

const createMainWindow = () => {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true
		},
		show: false
	});
	const menuTemplate = [
		{
			label: 'Download Problemset',
			click: downloadProblemset
		},
		{
			label: 'About',
			click: () => {
				showDialog({
					title: 'About',
					message: aboutText,
					detail: `GitHub: ${URL}`
				});
			}
		}
	];
	const menu = Menu.buildFromTemplate(menuTemplate);
	mainWindow.setMenu(menu);
	mainWindow.loadFile('./public/index.html');
	// mainWindow.webContents.openDevTools();
	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
		loadProblems();
	}); 
}

/** ---------- Event handlers: ---------- */
ipcMain.on('get-question', (e, tags, rating, page) => {
	if (problems.length === 0) {
		showDialog({
			message: 'No problem loaded. Click on "Download Problemset".'
		});
		e.returnValue = undefined;
		return;
	}
	let selectedIdx = -1;
	let count = 0;
	for (let i = 0; i < problems.length; i++) {
		if (!tags.every(x => problems[i].tags.includes(x)))
			continue;
		if (rating) {
			if (!problems[i].rating)  // avoid unrated problems when searching by rating.
				continue;
			if (problems[i].rating < rating.min || problems[i].rating > rating.max)
				continue;
		}
		if (page) {
			if (problems[i].page < page.min || problems[i].page > page.max)
				continue;
		}
		// problem i satisfies all search criteria.
		count++;
		if (Math.random() < (1.0 / count))
			selectedIdx = i;
	}
	if (selectedIdx === -1) {
		e.returnValue = {
			problem: undefined,
			nResults: 0,
			solvedRank: 0,
			nProblems: problems.length
		};
	}
	else {
		e.returnValue = {
			problem: problems[selectedIdx],
			nResults: count,
			solvedRank: selectedIdx,
			nProblems: problems.length
		};
	}
});
/** -------------------------------------------------- */

Menu.setApplicationMenu(false);
app.whenReady().then(createMainWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	// On macOS it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (BrowserWindow.getAllWindows().length === 0) {
		createMainWindow();
	}
});

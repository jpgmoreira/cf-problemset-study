const { clipboard, ipcRenderer } = require('electron');

const $getQuestion = document.getElementById('get-question');
const $searchTags = document.getElementById('search-tags');

const $matchedParent = document.getElementById('matched-parent');
const $matched = document.getElementById('matched');

const $questionInfo = document.getElementById('question-info');
const $questionLink = document.getElementById('question-link');
const $difficulty = document.getElementById('difficulty');
const $solved = document.getElementById('solved');
const $solvedRank = document.getElementById('solved-rank');
const $nProblems = document.getElementById('n-problems');
const $page = document.getElementById('page');
const $tags = document.getElementById('problem-tags');
const $showTags = document.getElementById('show-tags');

const $nPages = document.getElementById('n-pages');

const $minRating = document.getElementById('min-rating');
const $maxRating = document.getElementById('max-rating');

const $minPage = document.getElementById('min-page');
const $maxPage = document.getElementById('max-page');

$showTags.addEventListener('click', () => {
	if ($showTags.checked)
		$tags.classList.remove('hidden');
	else
		$tags.classList.add('hidden');
});

$getQuestion.addEventListener('click', () => {
	let searchTags = $searchTags.value.split(';').map(x => x.trim());
	searchTags = searchTags.filter(x => x !== '');
	
	let rating = undefined;
	const minRating = parseInt($minRating.value);
	const maxRating = parseInt($maxRating.value);
	if (minRating || maxRating) {
		rating = {
			min: (minRating ? minRating : 0),
			max: (maxRating ? maxRating : Infinity)
		};
	}

	let page = undefined;
	const minPage = parseInt($minPage.value);
	const maxPage = parseInt($maxPage.value);
	if (minPage || maxPage) {
		page = {
			min: (minPage ? minPage : 0),
			max: (maxPage ? maxPage : Infinity)
		};
	}

	const res = ipcRenderer.sendSync('get-question', searchTags, rating, page);
	if (!res) 
		return;

	$tags.classList.add('hidden');
	$showTags.checked = false;

	if (searchTags.length > 0 || rating || page) {
		$matchedParent.classList.remove('hidden');
		$matched.innerHTML = res.nResults;
	}
	else {
		$matchedParent.classList.add('hidden');
	}

	if (!res.problem) {
		$questionInfo.classList.add('hidden');
	}
	else {
		$questionInfo.classList.remove('hidden');
		
		const { contestId, index, name, rating, tags, solvedCount } = res.problem; 
		const url = `https://codeforces.com/problemset/problem/${contestId}/${index}`;

		$questionLink.addEventListener('click', () => {
			clipboard.writeText(url);
		});

		$questionLink.innerHTML = `${contestId}${index} - ${name}`;

		$difficulty.innerHTML = rating;

		$solved.innerHTML = solvedCount;

		$solvedRank.innerHTML = res.solvedRank;

		$nProblems.innerHTML = res.nProblems;

		$nPages.innerHTML = ( Math.floor(res.nProblems / 100.0) + 1 );

		$page.innerHTML = res.problem.page;

		$tags.innerHTML = tags.join('; ');
	}

});


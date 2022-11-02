import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import './css/styles.css';

axios.defaults.baseURL=`https://pixabay.com/api/`;
const PIXABAY_KEY=`31002352-08f9aee50f5995fc50a5ce26f`;

async function fetchPixabay(query, page, perPage) {
    const response = await axios.get(
      `?key=${PIXABAY_KEY}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`,
    );
    return response;
  };


const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const buttonLoadMore = document.querySelector('.load-more');
let query = '';
let page = 1;
const perPage = 40;
const simpleLightboxGallery = new SimpleLightbox('.photo-card_link', {
    captions: true,
    captionsData: 'alt',
    captionDelay: 250,
});

searchForm.addEventListener('submit', searchImagesInput);
buttonLoadMore.addEventListener('click', loadMore);
buttonLoadMore.classList.add('is-hidden');


function searchImagesInput(event) {
  event.preventDefault();
  query = event.currentTarget.elements.searchQuery.value.trim();
  if (query === ''){
    buttonLoadMore.classList.add('is-hidden');
    gallery.innerHTML = '';
    failureEmptySearch();
    return;
  }

  fetchPixabay(query, page, perPage)
    .then(({ data }) => {
      if (data.totalHits === 0) {
        buttonLoadMore.classList.add('is-hidden');
        failureNoMaching();  
      }
      else {
        renderGallery(data.hits);
        simpleLightboxGallery.refresh();
        successFound();
      }
    })
    .catch(error => console.log(error))
    .finally(() => {
      searchForm.reset();
    });
};

function loadMore() {
  page += 1;
  fetchPixabay(query, page, perPage)
    .then(({ data }) => {
        renderGallery(data.hits);
        simpleLightboxGallery.refresh();
        buttonLoadMore.classList.remove('is-hidden');

      const totalPages = Math.ceil(data.totalHits / perPage);

      if (page > totalPages) {
        buttonLoadMore.classList.add('is-hidden');
        failureEndOfSearch();
      }
    })
    .catch(error => console.log(error));
};

function successFound() {
  Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
};

function failureNoMaching() {
  Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.',);
};

function failureEndOfSearch() {
  Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.");
};

function failureEmptySearch() {
  Notiflix.Notify.failure('Please specify your search.');
};


function renderGallery(images) {
  const markup = images
    .map(image => {
      const { id, largeImageURL, webformatURL, tags, likes, views, comments, downloads } = image;
      return `
        <a class="photo-card_link" href="${largeImageURL}">
          <div class="photo-card" id="${id}">
            <img src="${webformatURL}" alt="${tags}" loading="lazy" />
            <div class="info">
              <p class="info-item">Likes: ${likes}</p>
              <p class="info-item">Views: ${views}</p>
              <p class="info-item">Comments: ${comments}</p>
              <p class="info-item">Downloads: ${downloads}</p>
            </div>
          </div>
        </a>
      `;
    })
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
  buttonLoadMore.classList.remove('is-hidden');
  simpleLightboxGallery.refresh();
};

buttonLoadMore.classList.add('is-hidden');
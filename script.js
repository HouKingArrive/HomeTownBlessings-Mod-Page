// script.js
document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.getElementById('mainContainer');
    const leftMenu = document.querySelector('.left-menu');
    const mainDisplay = document.querySelector('.main-display');
    const rightInfo = document.querySelector('.right-info');
    
    const itemList = document.getElementById('itemList');
    const imageGallery = document.getElementById('imageGallery');
    const itemDescription = document.getElementById('itemDescription');
    const searchInput = document.getElementById('searchInput');

    const itemNameDisplay = document.getElementById('itemNameDisplay');
    const itemCategories = document.getElementById('itemCategories');
    const languageSelect = document.getElementById('languageSelect');

    const authorName = document.getElementById('authorName');
    const socialMediaDropdown = document.getElementById('socialMediaDropdown');

    let allItemData_zh = {};
    let allItemData_en = {};
    
    let currentLanguage = 'zh';
    let uiTranslations = {};
    let selectedItemKey = null;

    async function loadUITranslations(lang) {
        try {
            const response = await fetch(`./language/${lang}/ui_${lang}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            uiTranslations = await response.json();
        } catch (error) {
            console.error('Error loading UI translations:', error);
        }
    }

    function updateUI() {
        // 導覽列和頁面標題
        const navTitle = document.getElementById('navTitle');
        if (navTitle) navTitle.textContent = uiTranslations.navTitle;
        
        // 新增：作者名稱翻譯
    const authorNameEl = document.getElementById('authorName');
    if (authorNameEl) authorNameEl.textContent = uiTranslations.authorName;

        const languageLabel = document.getElementById('languageLabel');
        if (languageLabel) languageLabel.textContent = uiTranslations.languageLabel;

        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) pageTitle.textContent = uiTranslations.pageTitle;
        
        const descriptionTitle = document.getElementById('descriptionTitle');
        if (descriptionTitle) descriptionTitle.textContent = uiTranslations.descriptionTitle;
        
        const categoryTitle = document.getElementById('categoryTitle');
        if (categoryTitle) categoryTitle.textContent = uiTranslations.categoryTitle;
        
        const imagePlaceholder = document.getElementById('imagePlaceholder');
        if (imagePlaceholder) imagePlaceholder.textContent = uiTranslations.imagePlaceholder;
        
        const itemDescriptionPlaceholder = document.getElementById('itemDescription');
        if (itemDescriptionPlaceholder) itemDescriptionPlaceholder.textContent = uiTranslations.itemDescriptionPlaceholder;
        
        const categoryPlaceholder = document.getElementById('categoryPlaceholder');
        if (categoryPlaceholder) categoryPlaceholder.textContent = uiTranslations.categoryPlaceholder;
        
        const searchInputEl = document.getElementById('searchInput');
        if (searchInputEl) searchInputEl.placeholder = uiTranslations.searchPlaceholder;

        if (selectedItemKey && allItemData_zh[selectedItemKey]) {
            const data = (currentLanguage === 'zh') ? allItemData_zh[selectedItemKey] : allItemData_en[selectedItemKey];
            if (itemDescriptionPlaceholder) itemDescriptionPlaceholder.textContent = data.description;
        }
    }

    function renderImages(images) {
        if (!imageGallery) return;

        imageGallery.classList.remove('fade-in');
        imageGallery.classList.add('fade-out');
    
        setTimeout(() => {
            imageGallery.innerHTML = '';
            
            if (!images || images.length === 0) {
                imageGallery.innerHTML = `<p class="placeholder-text">${uiTranslations.imagePlaceholder}</p>`;
            } else {
                images.forEach(imageUrl => {
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.alt = '物品圖片';
                    imageGallery.appendChild(img);
                });
            }
            imageGallery.classList.remove('fade-out');
            imageGallery.classList.add('fade-in');
        }, 300);
    }

    function renderItemList(dataToRender) {
        if (!itemList) return;
        
        itemList.innerHTML = '';
        if (Object.keys(dataToRender).length === 0) {
            itemList.innerHTML = `<p class="no-results-text" style="text-align: center; color: #888; padding: 10px;">${uiTranslations.noResults}</p>`;
        }

        for (const key in dataToRender) {
            if (dataToRender.hasOwnProperty(key)) {
                const li = document.createElement('li');
                li.setAttribute('data-item', key);
                
                const itemName = dataToRender[key].name;
                li.innerHTML = `<div class="item-info"><span class="item-name">${itemName}</span></div>`;
                itemList.appendChild(li);
            }
        }
    }

    function renderCategories(categories) {
        if (!itemCategories) return;

        itemCategories.classList.remove('fade-in');
        itemCategories.classList.add('fade-out');
    
        setTimeout(() => {
            itemCategories.innerHTML = '';
            if (!categories || categories.length === 0) {
                itemCategories.innerHTML = `<p class="placeholder-text">${uiTranslations.categoryPlaceholder}</p>`;
            } else {
                categories.forEach(category => {
                    const categoryTag = document.createElement('span');
                    categoryTag.textContent = category;
                    categoryTag.classList.add('category-tag');
                    
                    categoryTag.addEventListener('click', () => {
                        if(searchInput) searchInput.value = category;
                        filterAndRenderItems(category);
                    });
    
                    itemCategories.appendChild(categoryTag);
                });
            }
            itemCategories.classList.remove('fade-out');
            itemCategories.classList.add('fade-in');
        }, 300);
    }

    function filterAndRenderItems(searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        let sourceData = (currentLanguage === 'zh') ? allItemData_zh : allItemData_en;
        
        const filteredData = {};

        for (const key in sourceData) {
            const item = sourceData[key];
            const itemName = item.name.toLowerCase();
            const itemCategories = item.categories ? item.categories.map(cat => cat.toLowerCase()) : [];

            if (itemName.includes(lowerCaseSearchTerm) || itemCategories.some(cat => cat.includes(lowerCaseSearchTerm))) {
                filteredData[key] = item;
            }
        }
        renderItemList(filteredData);
    }
    
    function displaySelectedItem(key) {
        if (!key) return;

        selectedItemKey = key;
        
        document.querySelectorAll('#itemList li').forEach(item => {
            item.classList.remove('selected');
        });

        const selectedItemElement = itemList.querySelector(`[data-item="${key}"]`);
        if (selectedItemElement) {
            selectedItemElement.classList.add('selected');
        }

        const currentData = (currentLanguage === 'zh') ? allItemData_zh : allItemData_en;
        const oppositeData = (currentLanguage === 'zh') ? allItemData_en : allItemData_zh;

        if (currentData[selectedItemKey]) {
            const data = currentData[selectedItemKey];

             const images = data.images; // 取得圖片陣列

        // --- 核心邏輯：控制中間顯示區塊的顯示/隱藏 ---
        if (mainDisplay) {
            if (images && images.length > 0) {
                // 如果有圖片，顯示中間區塊並渲染圖片
                mainDisplay.style.display = 'flex'; 
                renderImages(images);
            } else {
                // 如果沒有圖片，隱藏整個中間區塊
                mainDisplay.style.display = 'none';
            }
        }
        // ---------------------------------------------
            
            const translatedName = oppositeData[selectedItemKey] ? oppositeData[selectedItemKey].name : 'Translation not found';
            const itemDescriptionText = data.description;
            
            if (itemNameDisplay) {
                itemNameDisplay.classList.remove('fade-in');
                itemNameDisplay.classList.add('fade-out');
                setTimeout(() => {
                    itemNameDisplay.textContent = translatedName;
                    itemNameDisplay.classList.remove('fade-out');
                    itemNameDisplay.classList.add('fade-in');
                }, 300);
            }

            if (itemDescription) {
                itemDescription.classList.remove('fade-in');
                itemDescription.classList.add('fade-out');
                setTimeout(() => {
                    itemDescription.textContent = itemDescriptionText;
                    itemDescription.classList.remove('fade-out');
                    itemDescription.classList.add('fade-in');
                }, 300);
            }

            renderCategories(data.categories);
            renderImages(data.images);
        }
    }

    function handleItemClick() {
        if (!itemList) return;

        itemList.addEventListener('click', (event) => {
            const clickedItem = event.target.closest('li');
            if (clickedItem) {
                const itemKey = clickedItem.getAttribute('data-item');
                displaySelectedItem(itemKey);
            }
        });
    }
    
    if (itemNameDisplay) {
        itemNameDisplay.addEventListener('click', () => {
            if (!selectedItemKey) return;
            
            const newLanguage = (currentLanguage === 'zh') ? 'en' : 'zh';
            
            const newDataSource = (newLanguage === 'zh') ? allItemData_zh : allItemData_en;
            
            if (newDataSource[selectedItemKey]) {
                if (languageSelect) {
                    languageSelect.value = newLanguage;
                    languageSelect.dispatchEvent(new Event('change'));
                }
            } else {
                console.warn(`Item with key "${selectedItemKey}" not found in ${newLanguage} data.`);
            }
        });
    }

    languageSelect.addEventListener('change', async (event) => {
        currentLanguage = event.target.value;
        await loadUITranslations(currentLanguage);
        updateUI();
        
        const currentData = (currentLanguage === 'zh') ? allItemData_zh : allItemData_en;
        
        renderItemList(currentData);
        
        // 修正：使用 setTimeout 確保 DOM 更新後再選中
        if (selectedItemKey) {
            setTimeout(() => {
                displaySelectedItem(selectedItemKey);
            }, 0);
        }
        
        filterAndRenderItems(searchInput.value);
    });
    
    if (searchInput) {
        searchInput.addEventListener('input', (event) => {
            filterAndRenderItems(event.target.value);
        });
    }

    // 處理點擊作者名稱顯示下拉選單
    if (authorName && socialMediaDropdown) {
        authorName.addEventListener('click', (event) => {
            // 切換下拉選單的顯示狀態
            socialMediaDropdown.classList.toggle('visible');
            event.stopPropagation(); // 阻止事件冒泡到 document
        });

        // 點擊其他地方時隱藏下拉選單
        document.addEventListener('click', (event) => {
            if (socialMediaDropdown.classList.contains('visible') && !authorName.contains(event.target)) {
                socialMediaDropdown.classList.remove('visible');
            }
        });
    }

    async function initializePage() {
        try {
            const [zhResponse, enResponse] = await Promise.all([
                fetch('./language/zh/items_zh.json'),
                fetch('./language/en/items_en.json')
            ]);
            
            if (!zhResponse.ok || !enResponse.ok) {
                 throw new Error(`HTTP error! status: ${zhResponse.status} or ${enResponse.status}`);
            }

            allItemData_zh = await zhResponse.json();
            allItemData_en = await enResponse.json();

            await loadUITranslations(currentLanguage);
            updateUI();
            
            renderItemList(allItemData_zh);
            handleItemClick();
    
            const firstItemKey = Object.keys(allItemData_zh)[0];
            if (firstItemKey) {
                displaySelectedItem(firstItemKey);
            } else {
                if (imageGallery) imageGallery.innerHTML = `<p class="placeholder-text">${uiTranslations.imagePlaceholder}</p>`;
            }
    
        } catch (error) {
            console.error('Error fetching data:', error);
            const itemDesc = document.getElementById('itemDescription');
            if (itemDesc) itemDesc.textContent = '無法載入資料，請檢查檔案路徑。';
        }
    }

    // function startLoadAnimation() {
    //     if (leftMenu) {
    //         setTimeout(() => {
    //             leftMenu.classList.remove('slide-in-hidden');
    //             leftMenu.classList.add('slide-in-animation');
    //         }, 300);
    //     }
    
    //     if (mainDisplay) {
    //         setTimeout(() => {
    //             mainDisplay.classList.remove('slide-in-hidden');
    //             mainDisplay.classList.add('slide-in-animation');
    //         }, 600);
    //     }
    
    //     if (rightInfo) {
    //         setTimeout(() => {
    //             rightInfo.classList.remove('slide-in-hidden');
    //             rightInfo.classList.add('slide-in-animation');
    //         }, 900);
    //     }
    
    //     if (mainContainer) {
    //         setTimeout(() => {
    //             mainContainer.classList.remove('fixed-container');
    //         }, 1200);
    //     }
    // }

    // 在 script.js 中
function startLoadAnimation() {
    // 初始時，將 no-scroll 類別加到 body
    document.body.classList.add('no-scroll');

    if (leftMenu) {
        setTimeout(() => {
            leftMenu.classList.remove('slide-in-hidden');
            leftMenu.classList.add('slide-in-animation');
        }, 300);
    }

    if (mainDisplay) {
        setTimeout(() => {
            mainDisplay.classList.remove('slide-in-hidden');
            mainDisplay.classList.add('slide-in-animation');
        }, 600);
    }

    if (rightInfo) {
        setTimeout(() => {
            rightInfo.classList.remove('slide-in-hidden');
            rightInfo.classList.add('slide-in-animation');
        }, 900);
    }

    if (mainContainer) {
        setTimeout(() => {
            mainContainer.classList.remove('fixed-container');
            // 在動畫結束後，移除 no-scroll 類別，恢復滾動
            document.body.classList.remove('no-scroll');
        }, 1200);
    }
}

    initializePage();
    startLoadAnimation();
});
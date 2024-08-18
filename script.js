document.addEventListener("DOMContentLoaded", function() {
    const roulette = document.querySelector('.roulette');
    const baseColors = ['#5ec7ff', '#ffffff'];

    if (Array.from(document.querySelectorAll('.item')).length % 2 !== 0) {
        Array.from(document.querySelectorAll('.item')).forEach(item => {
            const clone = item.cloneNode(true);
            roulette.appendChild(clone);
        });
    }

    let items = Array.from(document.querySelectorAll('.item'));
    const itemHeight = items[0].offsetHeight;
    let currentPosition = 0;
    let animationId;
    let speed = 0;
    let maxSpeed = 100;
    let isSpinning = false;
    let isStopping = false;
    let passedItemsCount = 0;

    // アイテムに交互の色を適用
    items.forEach((item, index) => {
        item.style.color = baseColors[index % 2];
    });

    // アイテムを循環させるための準備
    const totalHeight = itemHeight * items.length;
    const viewportHeight = window.innerHeight;
    const repeatCount = Math.ceil(viewportHeight / totalHeight) * 2 + 1;

    // 元のアイテムリストの色を保持しながらクローンを作成
    const originalItems = items.map(item => item.cloneNode(true));
    let allItems = [];
    let colorIndex = items.length % 2; // クローンの色が交互になるように調整

    for (let i = 0; i < repeatCount; i++) {
        originalItems.forEach((item) => {
            const clone = item.cloneNode(true);
            clone.style.color = baseColors[colorIndex % 2];
            roulette.appendChild(clone);
            allItems.push(clone);
            colorIndex++;
        });
    }

    // 元のアイテムを削除
    items.forEach(item => item.remove());

    // 新しいアイテムリストを取得
    items = Array.from(document.querySelectorAll('.item'));

    // 中央に最も近いアイテムを中央に移動する
    const closestItemIndex = Math.round(items.length / 2) - 1;
    currentPosition = closestItemIndex * itemHeight - (window.innerHeight / 2 - itemHeight / 2);
    roulette.style.transform = `translateY(${-currentPosition}px)`;

    function spin() {
        if (isSpinning || isStopping) return;
        isSpinning = true;
        speed = 0;

        let acceleration = Math.random() * 3 + 1;
        let spinDuration = Math.random() * 2000 + 5000;
        let startTime;
        let minSpeed = 1;

        function animate(timestamp) {
            if (!startTime) startTime = timestamp;
            let progress = timestamp - startTime;

            if (progress < spinDuration * 0.3) {
                speed = Math.min(speed + acceleration, maxSpeed);
            } else if (progress < spinDuration * 0.7) {
                speed = maxSpeed;
            } else {
                let decelerationRate = 1 - easeOutQuint((progress - spinDuration * 0.7) / (spinDuration * 0.5));
                speed = Math.max(maxSpeed * decelerationRate, minSpeed);
            }

            currentPosition += speed;
            if (currentPosition >= totalHeight * 2) {
                currentPosition -= totalHeight;
            }

            roulette.style.transform = `translateY(${-currentPosition}px)`;

            // アイテムのスケールと回転を更新
            updateItemScalesAndRotation();

            if (speed <= minSpeed && progress >= spinDuration * 0.7) {
                document.querySelectorAll('.item').forEach(item => {
                    const itemRect = item.getBoundingClientRect();
                    const itemCenter = itemRect.top + itemHeight / 2;
                    const viewportCenter = window.innerHeight / 2;

                    if (Math.abs(itemCenter - viewportCenter) <= 5) {
                        passedItemsCount++;

                        if (passedItemsCount === 3) {
                            enlargeItem(item);
                            smoothStop();
                        }
                    }
                });
            }

            if (!isStopping) {
                animationId = requestAnimationFrame(animate);
            }
        }

        animationId = requestAnimationFrame(animate);
    }

    function smoothStop() {
        isStopping = true;

        function decelerate() {
            if (speed > 0) {
                speed = Math.max(speed - 0.2, 0);
                currentPosition += speed;
                if (currentPosition >= totalHeight * 2) {
                    currentPosition -= totalHeight;
                }
                roulette.style.transform = `translateY(${-currentPosition}px)`;

                requestAnimationFrame(decelerate);
            } else {
                stopRoulette();
            }
        }

        decelerate();
    }

    function enlargeItem(item) {
        let scale = 1;
        function animateEnlarge() {
            if (scale < 1.5) {
                scale += 0.02;
                item.style.transform = `scale(${scale})`;
                requestAnimationFrame(animateEnlarge);
            }
        }
        animateEnlarge();
    }

    function stopRoulette() {
        isSpinning = false;
    }

    function easeOutQuint(t) {
        return 1 - Math.pow(1 - t, 5);
    }

    function updateItemScalesAndRotation() {
        const viewportCenter = window.innerHeight / 2;

        items.forEach(item => {
            const itemRect = item.getBoundingClientRect();
            const itemCenter = itemRect.top + itemHeight / 2;
            const distanceFromCenter = itemCenter - viewportCenter;
            const maxDistance = window.innerHeight / 2;

            // 中央に近いほど scale(1) に近づき、上下の端に近いほど scale(0.8) に近づく
            const scale = 1 - 0.4 * Math.abs(distanceFromCenter) / maxDistance;
            //const rotateX = -distanceFromCenter / maxDistance * 40; // 傾きが上に行くほど増えるようにし、方向を修正
            const rotateX = 0;
            item.style.transform = `scale(${scale}) rotateX(${rotateX}deg)`;
        });
    }

    // フォントの設定
    const textNodes = document.querySelectorAll("body .roulette *");
    textNodes.forEach(node => {
        node.innerHTML = node.textContent.split('').map(char => 
            `<span style="font-family: '${char.match(/[A-Za-z0-9!-/:-@¥[-{-~]/) ? 'Roboto' : 'Noto Sans JP'}', sans-serif;">${char}</span>`
        ).join('');
    });

    document.addEventListener('click', spin);
});

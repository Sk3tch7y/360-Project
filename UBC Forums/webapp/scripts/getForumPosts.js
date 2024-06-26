let communityPosts = [];
let pageNum = 0;
let morePosts = true; 
 
async function loadPosts(){
    await requestPosts().then(() =>{
        addPosts()
    });
}
async function requestPosts() {
    if(community != null){
        const response = await fetch(`../pages/postData.php?community=${encodeURIComponent(community)}&pageNum=${encodeURIComponent(pageNum)}&pin`);
        if (response.ok) {
            communityPosts = await response.json();
            pageNum +=1;
        } else {
            console.error('HTTP error', response.status);
        }
    }
    else{
        const response = await fetch(`../pages/postData.php?pageNum=${encodeURIComponent(pageNum)}`);;
        if (response.ok) {
            communityPosts = await response.json();
            pageNum +=1;
        } else {
            console.error('HTTP error', response.status);
        }
    }
}
async function getTextPosts(text){
    const postText = await fetch(text);
    if(!postText.ok){
        console.log("error");
    }
    else{
        let result = await postText.text();
        return result;
    }
}

async function addPosts(){
    let feed = $("#posts");
    if(communityPosts.length > 0 && morePosts == true){
        communityPosts.forEach(async post => {
            let username = await fetch(`../pages/getUsername.php?userId=${post.userId}`);
            username = await username.json();
            username = username.username;
            let postContent;
            if(post.postType == "txt"){
                //TODO: implement text reading from file
                let text = "Failed to load";
                text = await getTextPosts(`../posts/${post.postId}-${post.communityId}.${post.postType}`);
                postContent = 
                $(`
                ${post.pin == 0 || post.pin === null ?
                    `<div role='article'id = 'post-${post.postId}-${post.communityId}' class = 'textPost'>`:
                    `<div role='article'id = 'post-${post.postId}-${post.communityId}' class = 'pinTextPost'>`
                }
                    <div class = 'postHeader'>
                        <h3>${post.postTitle}</h3>
                        <div class = 'postDetails'>
                            <h4>${username}</h4>
                            <h5>${post.postTime}</h5>
                        </div>
                    </div>
                    <div class = 'postContent'>
                        <p>${text}</p>
                    </div>
                    <div role='aside'class = 'postOptions'>
                        <button class = 'promo' onClick = 'handlePromo(${post.postId}, ${post.communityId})'>^</button>
                        <p class = 'numPromo' id = 'promo-${post.postId}-${post.communityId}'>Promos: ${post.promos}</p>
                        ${
                            // Check if the user is a Forum Admin
                            isAdmin(userNum, community) ? (
                                `<div>
                                    ${post.pin == 0 || post.pin === null ?
                                        `<button class='pinButton' onClick='pinPosts(${post.postId}, ${post.pin})'>Pin</button>` :
                                        `<button class='pinButton' onClick='pinPosts(${post.postId}, ${post.pin})'>Pinned</button>`
                                    }
                                    <button class='deleteButton' onClick='deletePosts(${post.postId}, ${post.communityId})'>Delete</button>
                                </div>`
                            ) : ''
                        }
                    </div>
                </div>`
                );
            
            }
            else{
                isAdmin(userNum,community);
                postContent = 
                $(`
                ${post.pin == 0 || post.pin === null ?
                    `<div id='post-${post.postId}-${post.communityId}' class='post'>`:
                    `<div id='post-${post.postId}-${post.communityId}' class='pinPost'>`
                }
                    <div class='postHeader'>
                        <h3>${post.postTitle}</h3>
                        <div class='postDetails'>
                            <h4>${username}</h4>
                            <h5>${post.postTime}</h5>
                        </div>
                    </div>
                    <div class='postContent'>
                        <a class='blank' href='../posts/${post.postId}-${post.communityId}.${post.postType}'>
                            <img src="../posts/${post.postId}-${post.communityId}.${post.postType}">
                        </a>
                    </div>
                    <div class='postOptions'>
                        <button class='promo' onClick='handlePromo(${post.postId}, ${post.communityId})'>^</button>
                        <p class='numPromo' id='promo-${post.postId}-${post.communityId}'>Promos: ${post.promos}</p>
                        
                        ${post.pin == 0 || post.pin === null ?

                            `<button id='pinButton' onClick='pinPosts(${post.postId}, ${post.pin})'>Pin</button>`:
                            `<button id='pinButton' onClick='pinPosts(${post.postId}, ${post.pin})'>Unpin</button>`
                        }
                        <button id='deleteButton' onClick='deletePosts(${post.postId}, ${post.communityId})'>Delete</button>
                    </div>
                </div>
            `);
            }
            feed.append(postContent);
        });
    }else if(morePosts == true) {
        feed.append(`
            <h3>No more posts!</h3>
        `);
        morePosts = false;
    }
}
function isAdmin(userNum, community) {
    console.log(userNum)
    console.log(community)
    fetch('../scripts/checkAdmin.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `userIdNum=${userNum}&communityId=${community}`
    }).then(response => {
        if (response.ok) {
            return response.text();
        } else {
            console.log("Error:", response.statusText);
            throw new Error('Server returned error: ' + response.status);
        }
    }).then(data => {
        var pinButton = document.getElementById("pinButton");
        // var unpinButton = document.getElementById("unpinButton");
        var deleteButton = document.getElementById("deleteButton");
        if (data === "true") {
            console.log("true")
            pinButton.style.display = "block";
            // unpinButton.style.display = "block";
            deleteButton.style.display = "block";
            return true;
        } else if (data === "false") {
            console.log("false")
            pinButton.style.display = "none";
            // unpinButton.style.display = "none";
            deleteButton.style.display = "none";
            return false;
        } else {
            console.log("Unexpected response:", data);
        }
    }).catch(error => {
        console.error('Fetch error:', error);
    });
}
function pinPosts(postId, pin){
    fetch('../scripts/pinPost.php', 
        {
            method: 'POST',
            headers: 
            {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `postId=${postId}&pin=${pin}`
            
        }).then(response => 
            {
            if (response.ok) 
            {
                console.log("Post pinned");
            } else 
            {
                console.log("Post not pinned");
            }
            location.reload();
        });
}
function deletePosts(postId, communityId)
{
    // Show confirmation dialog
    if (window.confirm("Are you sure you want to delete this post?")) 
    {
        fetch('../scripts/deletePost.php', 
        {
            method: 'POST',
            headers: 
            {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `postId=${postId}&communityId=${communityId}`
            
        }).then(response => 
            {
            if (response.ok) 
            {
                console.log("Post deleted");
            } else 
            {
                console.log("Post not deleted");
            }
            location.reload();
        });
    } else {
        // If the user clicks "Cancel", log a message or perform some other actions
        console.log("Post deletion cancelled");
    }
}


function handlePromo(postId, communityId) {
    // Handle promo logic here
    promote(postId, communityId);
    console.log(`Promo clicked for post ${postId} in community ${communityId}`);
    // Toggle the background color of the button
    let promoButton = $(`#post-${postId}-${communityId} .promo`);
    promoButton.toggleClass("promo-active");
}
window.onload = function(){
    loadPosts();
    feed = $("#posts");
    feed.scroll(function() {
        
        if ( $(feed).scrollTop() + $(feed).height() > $(feed).prop('scrollHeight') - 100) {
            loadPosts();
        }
    });
    //getTestPosts();
    //addPosts();
};
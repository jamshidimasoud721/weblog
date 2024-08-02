document.getElementById('imageUpload').onclick = (function () {

    let xhttp = new XMLHttpRequest(); // new ajax
    let imageStatus = document.getElementById('imageStatus');
    let selectedImage = document.getElementById('selectedImage');
    let progressDiv = document.getElementById('progressDiv');
    let progressBar = document.getElementById('progressBar');
    let uploadResult = document.getElementById('uploadResult');

    xhttp.onreadystatechange = function () {
        if (xhttp.status === 200) {
            imageStatus.innerHTML = 'آپلود عکس موفقیت آمیز بود.';
            uploadResult.innerHTML = this.responseText;
            selectedImage.value = "";
        } else {
            imageStatus.innerHTML = this.responseText;
        }
    }

    xhttp.open('POST', '/dashboard/image-upload');

    xhttp.upload.onprogress = function (event) {
        if (event.lengthComputable) {
            let result = Math.floor((event.loaded / event.total) * 100);
            if (result !== 100) {
                progressBar.innerHTML = result + "%";
                progressBar.style = "width:" + result + "%";
            } else {
                progressDiv.style = "display:none";
            }
        }
    }

    let formData = new FormData(); // javascript default method
    if (selectedImage.files.length > 0) {
        progressDiv.style = "display:block";
        formData.append('image', selectedImage.files[0]);
        xhttp.send(formData);
    } else {
        imageStatus.innerHTML = 'برای آپلود باید عکسی انتخاب کنید.';
    }

});


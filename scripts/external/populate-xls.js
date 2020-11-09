    // Promise is not defined in IE so xlsx-populate uses a polyfill via JSZip.
    var Promise = XlsxPopulate.Promise;

    function getWorkbook(filename) {
			return new Promise(function (resolve, reject) {
					var req = new XMLHttpRequest();
					var url = `excels/${filename}`;
					req.open("GET", url, true);
					req.responseType = "arraybuffer";
					req.onreadystatechange = function () {
						if (req.readyState === 4){
							if (req.status === 200) {
									resolve(XlsxPopulate.fromDataAsync(req.response));
							} else {
									reject("Received a " + req.status + " HTTP code.");
							}
						}
					};

					req.send();
			});
    }

    function generate(data, templateType) {
        return getWorkbook(`${templateType}.template.xlsx`)
            .then(function (workbook) {
							data.forEach(item => {
								workbook.sheet(0).cell(item.cell).value(item.value);
							});
							return workbook.outputAsync({ type: undefined });
            });
    }

    function generateBlob(data, templateType) {
        return generate(data, templateType)
            .then(function (blob) {
                if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    window.navigator.msSaveOrOpenBlob(blob, "WT.xlsx");
                } else {
                    var url = window.URL.createObjectURL(blob);
                    var a = document.createElement("a");
                    document.body.appendChild(a);
                    a.href = url;
                    a.download = "WT.xlsx";
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                }
            })
            .catch(function (err) {
                alert(err.message || err);
                throw err;
            });
    }

    function generateBase64() {
			return generate("base64")
					.then(function (base64) {
							if (window.navigator && window.navigator.msSaveOrOpenBlob) {
									throw new Error("Navigating to data URI is not supported in IE.");
							} else {
									location.href = "data:" + XlsxPopulate.MIME_TYPE + ";base64," + base64;
							}
					})
					.catch(function (err) {
							alert(err.message || err);
							throw err;
					});
    }
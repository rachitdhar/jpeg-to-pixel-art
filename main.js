"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const file_input = document.getElementById("file_input");
const custom_file_button = document.getElementById("custom_file_button");
const resolution_input = document.getElementById("resolution_input");
const process_btn = document.getElementById("process_btn");
const canvas_input = document.getElementById("canvas_input");
const canvas = document.getElementById("canvas_output");
const img_input = document.getElementById("img_input");
const img_output = document.getElementById("img_output");
let image_uploaded;
let is_image_uploaded = false;
const canvas_context = canvas.getContext("2d", { willReadFrequently: true });
const canvas_input_context = canvas_input.getContext("2d", { willReadFrequently: true });
function get_file() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!file_input.files || file_input.files.length === 0) {
            alert("Please upload a .jpg file");
            is_image_uploaded = false;
            return;
        }
        const f = file_input.files[0];
        image_uploaded = yield createImageBitmap(f);
        is_image_uploaded = true;
        canvas_input.width = image_uploaded.width;
        canvas_input.height = image_uploaded.height;
        canvas.width = image_uploaded.width;
        canvas.height = image_uploaded.height;
        if (canvas_input_context) {
            canvas_input_context.drawImage(image_uploaded, 0, 0);
            img_input.src = canvas_input.toDataURL("image/jpeg");
            img_input.setAttribute("style", "display: block;");
        }
    });
}
function set_pixel_group(new_img_data, pixel, group_width, group_height, group_x, group_y) {
    for (let i = group_x; i < group_x + group_width; i += 1) {
        for (let j = group_y; j < group_y + group_height; j += 1) {
            let index = ((j * new_img_data.width) + i) * 4;
            new_img_data.data[index] = pixel[0];
            new_img_data.data[index + 1] = pixel[1];
            new_img_data.data[index + 2] = pixel[2];
            new_img_data.data[index + 3] = pixel[3];
        }
    }
}
function median(values) {
    if (values.length === 0) {
        throw new Error('Input array is empty');
    }
    values = [...values].sort((a, b) => a - b);
    const half = Math.floor(values.length / 2);
    return (values.length % 2 ? values[half] : (values[half - 1] + values[half]) / 2);
}
function get_pixel_image() {
    const resolution = parseInt(resolution_input.value);
    if (!resolution || resolution < 10 || resolution > 500) {
        alert("Enter a valid resolution (10 - 500)");
        return;
    }
    if (is_image_uploaded && canvas_input_context && canvas_context && resolution) {
        const img_data = canvas_input_context.getImageData(0, 0, canvas_input.width, canvas_input.height);
        const new_img_data = new ImageData(img_data.width, img_data.height);
        const group_width = Math.floor(img_data.width / resolution);
        const group_height = Math.floor(img_data.height / resolution);
        for (let group_x = 0; group_x < img_data.width; group_x += group_width) {
            for (let group_y = 0; group_y < img_data.height; group_y += group_height) {
                let r_arr = [];
                let g_arr = [];
                let b_arr = [];
                let a_arr = [];
                for (let i = group_x; i < group_x + group_width; i += 1) {
                    for (let j = group_y; j < group_y + group_height; j += 1) {
                        let index = ((j * img_data.width) + i) * 4;
                        r_arr.push(img_data.data[index]);
                        g_arr.push(img_data.data[index + 1]);
                        b_arr.push(img_data.data[index + 2]);
                        a_arr.push(img_data.data[index + 3]);
                    }
                }
                let new_pixel = [median(r_arr), median(g_arr), median(b_arr), median(a_arr)];
                set_pixel_group(new_img_data, new_pixel, group_width, group_height, group_x, group_y);
            }
        }
        canvas_context === null || canvas_context === void 0 ? void 0 : canvas_context.putImageData(new_img_data, 0, 0);
        img_output.src = canvas.toDataURL("image/jpeg");
        img_output.setAttribute("style", "display: block;");
        return;
    }
    alert("Please re-upload the image");
}
custom_file_button.addEventListener("click", () => file_input.click());
file_input.addEventListener("change", get_file);
process_btn.addEventListener("click", get_pixel_image);

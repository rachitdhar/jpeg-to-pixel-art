const file_input = document.getElementById("file_input") as HTMLInputElement;
const custom_file_button = document.getElementById("custom_file_button") as HTMLButtonElement;
const resolution_input = document.getElementById("resolution_input") as HTMLInputElement;
const process_btn = document.getElementById("process_btn") as HTMLButtonElement;
const canvas_input = document.getElementById("canvas_input") as HTMLCanvasElement;
const canvas = document.getElementById("canvas_output") as HTMLCanvasElement;
const img_input = document.getElementById("img_input") as HTMLImageElement;
const img_output = document.getElementById("img_output") as HTMLImageElement;

let image_uploaded: ImageBitmap;
let is_image_uploaded: boolean = false;
const canvas_context: CanvasRenderingContext2D | null = canvas.getContext("2d", { willReadFrequently: true });
const canvas_input_context: CanvasRenderingContext2D | null = canvas_input.getContext("2d", { willReadFrequently: true });

async function get_file(): Promise<void> {
    if (!file_input.files || file_input.files.length === 0) {
        alert("Please upload a .jpg file");
        is_image_uploaded = false;
        return;
    }
    const f = file_input.files[0];
    image_uploaded = await createImageBitmap(f);
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
}

function set_pixel_group(new_img_data: ImageData, pixel: number[], group_width: number, group_height: number, group_x: number, group_y: number): void {
    for (let i: number = group_x; i < group_x + group_width; i += 1) {
        for (let j: number = group_y; j < group_y + group_height; j += 1) {
            let index: number = ((j * new_img_data.width) + i) * 4;

            new_img_data.data[index] = pixel[0];
            new_img_data.data[index + 1] = pixel[1];
            new_img_data.data[index + 2] = pixel[2];
            new_img_data.data[index + 3] = pixel[3];
        }
    }
}

function median(values: number[]): number {
    if (values.length === 0) {
      throw new Error('Input array is empty');
    }

    values = [...values].sort((a, b) => a - b);
    const half = Math.floor(values.length / 2);

    return (values.length % 2 ? values[half] : (values[half - 1] + values[half]) / 2);
}

function get_pixel_image(): void {
    const resolution: number = parseInt(resolution_input.value);

    if (!resolution || resolution < 10 || resolution > 500) {
        alert("Enter a valid resolution (10 - 500)");
        return;
    }

    if (is_image_uploaded && canvas_input_context && canvas_context && resolution) {
        const img_data: ImageData = canvas_input_context.getImageData(0, 0, canvas_input.width, canvas_input.height);
        const new_img_data: ImageData = new ImageData(img_data.width, img_data.height);
        
        const group_width: number = Math.floor(img_data.width / resolution);
        const group_height: number = Math.floor(img_data.height / resolution);

        for (let group_x = 0; group_x < img_data.width; group_x += group_width) {
            for (let group_y = 0; group_y < img_data.height; group_y += group_height) {
                let r_arr: number[] = [];
                let g_arr: number[] = [];
                let b_arr: number[] = [];
                let a_arr: number[] = [];

                for (let i: number = group_x; i < group_x + group_width; i += 1) {
                    for (let j: number = group_y; j < group_y + group_height; j += 1) {
                        let index: number = ((j * img_data.width) + i) * 4;
                        r_arr.push(img_data.data[index]);
                        g_arr.push(img_data.data[index + 1]);
                        b_arr.push(img_data.data[index + 2]);
                        a_arr.push(img_data.data[index + 3]);
                    }
                }
                let new_pixel: number[] = [median(r_arr), median(g_arr), median(b_arr), median(a_arr)];
                set_pixel_group(new_img_data, new_pixel, group_width, group_height, group_x, group_y);
            }
        }

        canvas_context?.putImageData(new_img_data, 0, 0);
        img_output.src = canvas.toDataURL("image/jpeg");
        img_output.setAttribute("style", "display: block;");
        return;
    }
    alert("Please re-upload the image");
}

custom_file_button.addEventListener("click", () => file_input.click());
file_input.addEventListener("change", get_file);
process_btn.addEventListener("click", get_pixel_image);
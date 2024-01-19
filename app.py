'''https://customtkinter.tomschimansky.com/documentation/packaging'''
import customtkinter as ctk
from pathlib import Path
import subprocess


# ===== CTK Visual =====
ctk.set_default_color_theme('blue')
ctk.set_appearance_mode('dark')


# ===== Main App Class =====
class App(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title('FFmpeg GUI')
        self.geometry('600x340')

        self.grid_rowconfigure(0, weight=1)
        self.grid_columnconfigure(0, weight=1)
        self.resizable(False, False)


# ===== Main Frame Class =====
class Frame(ctk.CTkFrame):
    def __init__(self, master):
        super().__init__(master)
        self.grid(row=0, column=0, padx=8, pady=8, sticky='nsew')

        self.grid_columnconfigure(0, weight=1)
        self.grid_columnconfigure(1, weight=1)
        self.grid_columnconfigure(2, weight=1)
        self.grid_columnconfigure(3, weight=1)


# ===== General App Init =====
app = App()
frame = Frame(app)

title = ctk.CTkLabel(frame, text='FFmpeg GUI', font=('Segoe UI', 20))
title.grid(row=0, column=1, columnspan=2, padx=8, pady=8, sticky='ew')

author = ctk.CTkLabel(frame, text='by. Haoming', text_color='grey')
author.grid(row=0, column=3, padx=8, pady=8, sticky='ew')


# ===== Input Path =====
input_frame = ctk.CTkFrame(frame)
input_frame.grid(row=1, column=0, padx=8, pady=8, sticky='ew')

input_frame.grid_columnconfigure(0, weight=1)
input_frame.grid_columnconfigure(1, weight=1)

input_entry = ctk.CTkEntry(frame, placeholder_text='Path to Input Video')
input_entry.grid(row=1, column=1, columnspan=3, padx=8, pady=8, sticky='ew')

def set_input():
    f = str(ctk.filedialog.askopenfilename(title='Input Video')).strip()
    if len(f) > 0:
        l = len(input_entry.get())
        input_entry.delete(0, l)
        input_entry.insert(0, str(f))

open_btn1 = ctk.CTkButton(input_frame, text='📂', width=60, command=set_input)
open_btn1.grid(row=0, column=0, padx=4, pady=4, sticky='w')

input_label = ctk.CTkLabel(input_frame, text='Input: ')
input_label.grid(row=0, column=1, padx=4, pady=4, sticky='w')


# ===== Output Path =====
output_frame = ctk.CTkFrame(frame)
output_frame.grid(row=2, column=0, padx=8, pady=8, sticky='ew')

output_frame.grid_columnconfigure(0, weight=1)
output_frame.grid_columnconfigure(1, weight=1)

output_entry = ctk.CTkEntry(frame, placeholder_text='Path to Output Folder (Leave empty to write next to the program)')
output_entry.grid(row=2, column=1, columnspan=3, padx=8, pady=8, sticky='ew')

def set_output():
    f = str(ctk.filedialog.askdirectory(title='Output Path')).strip()
    if len(f) > 0:
        l = len(output_entry.get())
        output_entry.delete(0, l)
        output_entry.insert(0, str(f))

open_btn1 = ctk.CTkButton(output_frame, text='📂', width=60, command=set_output)
open_btn1.grid(row=0, column=0, padx=4, pady=4, sticky='w')

output_label = ctk.CTkLabel(output_frame, text='Output: ')
output_label.grid(row=0, column=1, padx=4, pady=4, sticky='w')


# ===== Dropdown Labels =====
codec_label = ctk.CTkLabel(frame, text='Video Codec')
codec_label.grid(row=3, column=0, padx=8, pady=(8, 2), sticky='ew')
quality_label = ctk.CTkLabel(frame, text='Video Quality')
quality_label.grid(row=3, column=1, padx=8, pady=(8, 2), sticky='ew')
audio_label = ctk.CTkLabel(frame, text='Audio Codec')
audio_label.grid(row=3, column=2, padx=8, pady=(8, 2), sticky='ew')
bitrate_label = ctk.CTkLabel(frame, text='Audio Quality')
bitrate_label.grid(row=3, column=3, padx=8, pady=(8, 2), sticky='ew')


# ===== Dropdown Menus =====
codec_optionMenu = ctk.CTkOptionMenu(
    frame,
    values=[
        'H.264',
        'HEVC',
        'VP9',
        'Copy',
        'None',
    ],
)

codec_optionMenu.grid(row=4, column=0, padx=8, pady=(2, 8), sticky='ew')

quality_optionMenu = ctk.CTkOptionMenu(
    frame,
    values=[
        'Draft',
        'Low',
        'Medium',
        'High',
        'Extreme',
    ],
)

quality_optionMenu.grid(row=4, column=1, padx=8, pady=(2, 8), sticky='ew')

audio_optionMenu = ctk.CTkOptionMenu(
    frame,
    values=[
        'AAC',
        'MP3',
        'Opus',
        'Vorbis',
        'Copy',
        'None',
    ],
)

audio_optionMenu.grid(row=4, column=2, padx=8, pady=(2, 8), sticky='ew')

bitrate_optionMenu = ctk.CTkOptionMenu(
    frame,
    values=[
        'Low',
        'Medium',
        'High',
    ],
)

bitrate_optionMenu.grid(row=4, column=3, padx=8, pady=(2, 8), sticky='ew')


# ===== Hardware Acceleration =====
hwaccel_label = ctk.CTkLabel(frame, text='Hardware Acceleration')
hwaccel_label.grid(row=5, column=0, padx=8, pady=(8, 2), sticky='ew')

hwaccel_optionMenu = ctk.CTkOptionMenu(
    frame,
    values=[
        'CPU',
        'NVENC',
    ],
)

hwaccel_optionMenu.grid(row=6, column=0, padx=8, pady=(2, 8), sticky='ew')


# ===== Custom Flags =====
custom_label = ctk.CTkLabel(frame, text='Custom Flags')
custom_label.grid(row=5, column=1, columnspan=2, padx=8, pady=(8, 2), sticky='ew')

custom_entry = ctk.CTkEntry(frame, placeholder_text='-pix_fmt yuv420p -vf "fps=fps=24000/1001"')
custom_entry.grid(row=6, column=1, columnspan=2, padx=8, pady=(2, 8), sticky='ew')


# ===== Progress Bar =====
progressbar = ctk.CTkProgressBar(frame, orientation="horizontal")
progressbar.grid(row=7, column=0, columnspan=4, padx=8, pady=4, sticky='ew')
progressbar.set(0.0)


# ===== Main Function =====
def RUN():
    progressbar.set(0.0)
    input_path = Path(str(input_entry.get()).strip('"'))
    output_path = Path(str(output_entry.get()).strip('"'))

    if not (input_path.exists() and input_path.is_file()):
        print('\n[Error] Invalid Input File...')
        return

    if not output_path.is_dir():
        print('\n[Error] Invalid Output Path...')
        return

    cv = codec_optionMenu.get()
    vp = quality_optionMenu.get()
    ca = audio_optionMenu.get()
    ba = bitrate_optionMenu.get()
    hw = hwaccel_optionMenu.get()
    fl = custom_entry.get()

    if '-vf' in fl and cv == 'Copy':
        print('\n[Error] Must Re-Encode when using filter...')
        return

    cmds = ['ffmpeg']
    cmds.append('-hide_banner')

    cmds.append('-hwaccel')
    cmds.append('auto')

    cmds.append('-i')
    cmds.append(f'"{input_path}"')

    cmds.append('-vcodec')
    match(cv):
        case 'H.264':
            if hw == 'CPU':
                cmds.append('h264')
            else:
                cmds.append('h264_nvenc')

            cmds.append('-crf')
            match(vp):
                case 'Draft':
                    cmds.append('32')
                case 'Low':
                    cmds.append('24')
                case 'Medium':
                    cmds.append('16')
                case 'High':
                    cmds.append('8')
                case 'Extreme':
                    cmds.append('4')

        case 'HEVC':
            if hw == 'CPU':
                cmds.append('hevc')
            else:
                cmds.append('hevc_nvenc')

            cmds.append('-qp')
            match(vp):
                case 'Draft':
                    cmds.append('32')
                case 'Low':
                    cmds.append('24')
                case 'Medium':
                    cmds.append('16')
                case 'High':
                    cmds.append('8')
                case 'Extreme':
                    cmds.append('4')

        case 'VP9':
            cmds.append('vp9')

            cmds.append('-b:v')
            cmds.append('0')

            cmds.append('-crf')
            match(vp):
                case 'Draft':
                    cmds.append('32')
                case 'Low':
                    cmds.append('24')
                case 'Medium':
                    cmds.append('16')
                case 'High':
                    cmds.append('8')
                case 'Extreme':
                    cmds.append('4')

        case 'Copy':
            cmds.append('copy')

        case 'None':
            cmds.pop(-1)
            cmds.append('-vn')

    cmds.append('-acodec')
    match(ca):
        case 'AAC':
            cmds.append('aac')
        case 'MP3':
            cmds.append('libmp3lame')
        case 'Opus':
            cmds.append('libopus')
        case 'Vorbis':
            cmds.append('libvorbis')
        case 'Copy':
            cmds.append('copy')
        case 'None':
            cmds.pop(-1)
            cmds.append('-an')

    cmds.append('-b:a')
    match(ba):
        case 'High':
            cmds.append('320k')
        case 'Medium':
            cmds.append('256k')
        case 'Low':
            cmds.append('128k')

    if len(fl) > 0:
        import shlex
        flags = shlex.split(fl, posix=False)
        cmds += flags

    output = output_path.joinpath(input_path.name)

    # Prevent Overriding
    while output.exists():
        output = output.parent.joinpath(f'{output.stem}_{output.suffix}')

    cmds.append(f'"{output}"')
    # print(cmds)

    TOTAL = -1
    CURRENT = -1

    process = subprocess.Popen(' '.join(cmds), shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,universal_newlines=True)
    for line in process.stdout:
        # Loading
        if TOTAL < 0:
            # Duration: hh:mm:ss.ms, start: XXX, bitrate: YYY
            if 'Duration' in line:
                t = line.split(',', 1)[0].split(':', 1)[1]
                h, m, s = t.split(':')

                TOTAL = int(h) * 3600 + int(m) * 60 + float(s)

        # Running
        else:
            # frame= X fps= Y q= Z size= A time=hh:mm:ss.ms bitrate= B speed= C
            if 'time' in line:
                t = line.split('time=', 1)[1].split(' b', 1)[0]
                h, m, s = t.split(':')

                CURRENT = int(h) * 3600 + int(m) * 60 + float(s)
                progressbar.set(float(CURRENT/TOTAL))
                app.update()

    process.wait()
    print('Done!')

# ===== Run Button =====
run_btn = ctk.CTkButton(frame, text='Run', command=RUN)
run_btn.grid(row=5, rowspan=2, column=3, padx=8, pady=8, sticky='sen')

# ===== Program Loop =====
app.mainloop()

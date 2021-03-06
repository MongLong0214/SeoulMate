import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as API from '../../api';
import Swal from 'sweetalert2';

import './Upload.css';

// import recoil
import { useRecoilState, useRecoilValue } from 'recoil';
import { userInfoState, landmarkPicState } from '../../atom';

import {
    UploadWrapper,
    UploadContainer,
    UploadPlaceholder,
    UploadContent,
    UploadButtonContainer,
    UploadButton,
    UploadCancelButton,
} from './UploadStyle';

const Upload = () => {
    const user = useRecoilValue(userInfoState);
    const navigate = useNavigate();
    const [avatar, setAvatar] = useState(null);
    const filepickerRef = useRef();

    const [landmarkPic, setLandmarkPic] = useRecoilState(landmarkPicState);
    const [landmarkInfo, setLandmarkInfo] = useState('');

    const uploadAvatar = (e) => {
        const reader = new FileReader();
        if (e.target.files[0]) {
            reader.readAsDataURL(e.target.files[0]);
        }
        reader.onload = (readerEvent) => {
            setAvatar(readerEvent.target.result);
        };

        API.post('ai')
            .then((res) => {
                setLandmarkInfo(() => {
                    return res.data;
                });

                const formData = new FormData();
                formData.append('image', e.target.files[0]);
                formData.append('user_id', user.user_id);
                formData.append('landmark_id', res.data.landmark_id);
                API.sendImage('visited/images', formData)
                    .then((res) => {
                        setLandmarkPic(() => {
                            return res.data;
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            })
            .catch((err) => {
                console.log(err);
            });
    };

    useEffect(() => {
        console.log('info', landmarkInfo);
        console.log('pic', landmarkPic);
    }, [landmarkInfo, landmarkPic]);

    const uploadHandler = () => {
        avatar
            ? setTimeout(() => {
                  navigate('/uploadResult', {
                      state: { landmarkInfo: landmarkInfo, landmarkPic: landmarkPic },
                  });
              }, 500)
            : Swal.fire({
                  title: '?????? ????????? ????????? ?????????',
                  icon: 'warning',
                  confirmButtonColor: '#3085d6', // confrim ?????? ?????? ??????
                  cancelButtonColor: '#d33', // cancel ?????? ?????? ??????
                  confirmButtonText: '??????', // confirm ?????? ????????? ??????
              });
    };

    // ????????? ?????????????????? ????????? ???????????? , ????????? ??? ????????????
    const uploadCancelButtonHandler = async () => {
        if (avatar) {
            await API.delData(`visited/${landmarkPic.index}`);
            navigate('/');
        } else {
            navigate('/');
        }
    };
    return (
        <UploadWrapper>
            <UploadContainer>
                {!avatar && (
                    <UploadPlaceholder onClick={() => filepickerRef.current.click()}>
                        <span style={{ textAlign: 'center', fontSize: '1.1rem' }}>
                            <p style={{ fontSize: '3.1rem', marginBottom: '1.3rem' }}>+</p>
                            <p>????????? ???????????????, </p>
                            <p>???????????? ????????? ???????????????.</p>
                        </span>
                    </UploadPlaceholder>
                )}
                {avatar && (
                    <UploadContent
                        src={avatar}
                        alt="img"
                        onClick={() => filepickerRef.current.click()}
                    />
                )}
                <input hidden onChange={uploadAvatar} ref={filepickerRef} type="file" />
            </UploadContainer>
            <UploadButtonContainer>
                <UploadButton onClick={uploadHandler}>?????????</UploadButton>
                <UploadCancelButton onClick={uploadCancelButtonHandler}>
                    ????????????{' '}
                </UploadCancelButton>
            </UploadButtonContainer>
        </UploadWrapper>
    );
};

export default Upload;

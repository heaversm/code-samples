import React, { useEffect, useState, useContext } from "react";
import AppContext from '../../contexts/AppContext';
import styles from './Fade.module.scss';
import cx from 'classnames';

const Fade = ({ children }) => {


  const { doFade } = useContext(
    AppContext
  );

  const [render, setRender] = useState(doFade);

  useEffect(() => {
    if (doFade) setRender(true);
  }, [doFade]);

  const onAnimationEnd = () => {
    if (!doFade) setRender(false);
  };

  const fadeAnim = cx({
    [styles.fadeIn]: doFade,
    [styles.fadeOut]: !doFade,
  });


  return (
    render ? (
      <div
        className={fadeAnim}
        onAnimationEnd={onAnimationEnd}
      >
        {children}
      </div>
    ) : (
        <div className={styles.hidden}/>
      )
  );
};

export default Fade;

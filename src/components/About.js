// Create your About component here
import IMG from '../assets/Detective.png'; // Make sure this path is correct

const About = () => {
  return (
    <div id="about" className="about">
      <h1 className="about-heading">About Me</h1>
      <div className="about-info">
        <p className="about-desc">I'm a pro in React</p> {/* Replace with your description */}
        <div className="about-img">
          <div className="about-img-wrapper">
            <img src={IMG} alt="Detective" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
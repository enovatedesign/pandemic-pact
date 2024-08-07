import Link from 'next/link';
import Image from 'next/image';
import FooterMenu from './FooterMenu';
import {
    footerLinksFirstCollection,
    footerLinksSecondCollection,
} from '../helpers/nav';
import FooterCopyrightStatement from './FooterCopyrightStatement';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect } from 'react';
import { ExternalLinkIcon } from '@heroicons/react/solid';
import homepageTotals from '../../data/dist/homepage-totals.json';
import {useReducedMotion} from "@react-spring/web"

gsap.registerPlugin(ScrollTrigger);

interface imageLinkProps {
    href: string;
    src: string;
    alt: string;
    width: number;
    height: number;
    classes?: string;
}
[];

export default function Footer() {
    const NavItem = (link: { label: string; href: string }) => (
        <li key={link.href}>
            <Link href={link.href} className={`text-gray-700 hover:underline`}>
                {link.label}
            </Link>
        </li>
    );

    const reducedMotion = useReducedMotion()

    useEffect(() => {
        if (!reducedMotion) {
            const logoCircles = document.querySelectorAll('#logo-circles path');
            const svgBlurFilter = document.querySelector('#gaussianBlur');
    
            // Position the logo circles randomly
            gsap.set(logoCircles, {
                x: () => gsap.utils.random(-100, 100),
                y: () => gsap.utils.random(-100, 0),
                opacity: 0,
                scale: 3,
            });
    
            // Animate the logo circles back into position
            gsap.to(logoCircles, {
                scrollTrigger: {
                    trigger: '#logo-circles',
                    scrub: 4,
                    start: 'top bottom',
                    end: 'bottom max',
                },
                x: 0,
                y: 0,
                opacity: 1,
                duration: 6,
                stagger: 0.2,
                scale: 1,
            });
    
            // Animate the SVG blur filter to zero
            gsap.to(svgBlurFilter, {
                scrollTrigger: {
                    trigger: '#logo-circles',
                    scrub: 4,
                    start: 'top bottom',
                    end: 'bottom max',
                },
                duration: 6,
                attr: { stdDeviation: 0 },
            });
    
            const timeline = gsap.timeline({
                scrollTrigger: {
                    trigger: '#logo-circles',
                }
            })
    
            timeline.scrollTrigger?.refresh()
        }
    });

    const Logo = () => (
        <svg
            width="100%"
            height="100%"
            viewBox="0 0 183 96"
            className="overflow-visible"
        >
            {!reducedMotion && (
                <defs>
                    <filter id="blur">
                        <feGaussianBlur id="gaussianBlur" in="SourceGraphic" stdDeviation="4" />
                    </filter>
                </defs>
            )}
            <g id="logo-circles" filter="url(#blur)">
                
                <path
                    d="M14.97,22.321c0,-1.603 1.304,-2.908 2.908,-2.908c1.602,0 2.903,1.305 2.903,2.908c0,1.604 -1.301,2.906 -2.903,2.906c-1.604,0 -2.908,-1.302 -2.908,-2.906"
                    fill="#79cccb"
                />
                <path
                    d="M15.83,13.248c0,-1.2 0.949,-2.169 2.109,-2.169c1.165,-0 2.108,0.969 2.108,2.169c0,1.197 -0.943,2.17 -2.108,2.17c-1.16,-0 -2.109,-0.973 -2.109,-2.17"
                    fill="#79cccb"
                />
                <path
                    d="M35.413,13.054c-0,-1.672 1.357,-3.028 3.032,-3.028c1.675,0 3.031,1.356 3.031,3.028c-0,1.673 -1.356,3.029 -3.031,3.029c-1.675,0 -3.032,-1.356 -3.032,-3.029"
                    fill="#a7a9ac"
                />
                <path
                    d="M23.655,12.461c0,-1.537 1.248,-2.784 2.787,-2.784c1.536,0 2.779,1.247 2.779,2.784c0,1.537 -1.243,2.783 -2.779,2.783c-1.539,-0 -2.787,-1.246 -2.787,-2.783"
                    fill="#79cccb"
                />
                <path
                    d="M47.611,13.159c-0,-2.019 1.641,-3.659 3.659,-3.659c2.022,0 3.658,1.64 3.658,3.659c-0,2.02 -1.636,3.658 -3.658,3.658c-2.018,0 -3.659,-1.638 -3.659,-3.658"
                    fill="#79cccb"
                />
                <path
                    d="M60.461,15.154c0,-2.019 1.64,-3.658 3.659,-3.658c2.019,0 3.659,1.639 3.659,3.658c0,2.022 -1.64,3.66 -3.659,3.66c-2.019,0 -3.659,-1.638 -3.659,-3.66"
                    fill="#79cccb"
                />
                <path
                    d="M57.706,3.151c0,-1.685 1.364,-3.053 3.052,-3.053c1.683,-0 3.049,1.368 3.049,3.053c0,1.685 -1.366,3.05 -3.049,3.05c-1.688,-0 -3.052,-1.365 -3.052,-3.05"
                    fill="#afd46c"
                />
                <path
                    d="M70.809,6.457c0,-1.343 1.085,-2.428 2.426,-2.428c1.34,0 2.423,1.085 2.423,2.428c0,1.339 -1.083,2.426 -2.423,2.426c-1.341,0 -2.426,-1.087 -2.426,-2.426"
                    fill="#79cccb"
                />
                <path
                    d="M82.912,12.819c0,-1.478 1.195,-2.677 2.674,-2.677c1.477,0 2.671,1.199 2.671,2.677c0,1.478 -1.194,2.678 -2.671,2.678c-1.479,0 -2.674,-1.2 -2.674,-2.678"
                    fill="#79cccb"
                />
                <path
                    d="M43.584,3.287c0,-1.818 1.474,-3.288 3.294,-3.288c1.822,0 3.292,1.47 3.292,3.288c0,1.819 -1.47,3.295 -3.292,3.295c-1.82,0 -3.294,-1.476 -3.294,-3.295"
                    fill="#79cccb"
                />
                <path
                    d="M32.725,4.434c0,-1.396 1.129,-2.53 2.53,-2.53c1.402,0 2.526,1.134 2.526,2.53c0,1.396 -1.124,2.529 -2.526,2.529c-1.401,0 -2.53,-1.133 -2.53,-2.529"
                    fill="#79cccb"
                />
                <path
                    d="M6.867,23.421c0,-1.1 0.893,-1.996 1.994,-1.996c1.101,0 1.994,0.896 1.994,1.996c0,1.102 -0.893,1.994 -1.994,1.994c-1.101,0 -1.994,-0.892 -1.994,-1.994"
                    fill="#79cccb"
                />
                <path
                    d="M1.595,45.25c0,-1.371 1.116,-2.483 2.487,-2.483c1.371,0 2.481,1.112 2.481,2.483c0,1.371 -1.11,2.484 -2.481,2.484c-1.371,0 -2.487,-1.113 -2.487,-2.484"
                    fill="#f4793b"
                />
                <path
                    d="M6.989,33.171c0,-1.54 1.251,-2.792 2.792,-2.792c1.542,0 2.791,1.252 2.791,2.792c-0,1.542 -1.249,2.793 -2.791,2.793c-1.541,0 -2.792,-1.251 -2.792,-2.793"
                    fill="#79cccb"
                />
                <path
                    d="M0.799,36.665c0,-0.965 0.78,-1.748 1.747,-1.748c0.966,0 1.747,0.783 1.747,1.748c0,0.964 -0.781,1.75 -1.747,1.75c-0.967,0 -1.747,-0.786 -1.747,-1.75"
                    fill="#79cccb"
                />
                <path
                    d="M7.206,57.363c0,-1.578 1.279,-2.859 2.861,-2.859c1.579,0 2.856,1.281 2.856,2.859c0,1.578 -1.277,2.856 -2.856,2.856c-1.582,0 -2.861,-1.278 -2.861,-2.856"
                    fill="#79cccb"
                />
                <path
                    d="M0.002,58.999c0,-1.236 1,-2.242 2.242,-2.242c1.24,0 2.242,1.006 2.242,2.242c0,1.239 -1.002,2.242 -2.242,2.242c-1.242,0 -2.242,-1.003 -2.242,-2.242"
                    fill="#79cccb"
                />
                <path
                    d="M4.83,69.281c0,-1.558 1.261,-2.82 2.82,-2.82c1.559,0 2.815,1.262 2.815,2.82c0,1.552 -1.256,2.813 -2.815,2.813c-1.559,0 -2.82,-1.261 -2.82,-2.813"
                    fill="#79cccb"
                />
                <path
                    d="M8.311,80.618c0,-1.326 1.079,-2.405 2.411,-2.405c1.325,0 2.403,1.079 2.403,2.405c0,1.333 -1.078,2.409 -2.403,2.409c-1.332,0 -2.411,-1.076 -2.411,-2.409"
                    fill="#79cccb"
                />
            </g>
            <g>
                <path
                    d="M23.962,83.232l0,-7.008l-2.667,0l0,-1.363l6.804,0l0,1.363l-2.666,0l0,7.008l-1.471,0Zm4.651,0l0,-6.314l1.46,0l0,1.423c0.394,-0.945 1.124,-1.591 2.236,-1.543l0,1.531l-0.084,0c-1.267,0 -2.152,0.825 -2.152,2.499l0,2.404l-1.46,0Zm6.47,0.132c-1.184,0 -2.248,-0.682 -2.248,-1.95l0,-0.023c0,-1.364 1.076,-2.034 2.619,-2.034c0.706,0 1.208,0.108 1.698,0.264l0,-0.156c0,-0.897 -0.55,-1.375 -1.567,-1.375c-0.705,0 -1.231,0.155 -1.805,0.394l-0.395,-1.135c0.706,-0.312 1.387,-0.515 2.392,-0.515c0.945,0 1.65,0.251 2.093,0.706c0.466,0.454 0.682,1.124 0.682,1.949l0,3.743l-1.411,0l0,-0.789c-0.432,0.514 -1.089,0.921 -2.058,0.921Zm0.407,-1.053c0.957,0 1.686,-0.55 1.686,-1.351l0,-0.43c-0.371,-0.144 -0.861,-0.251 -1.435,-0.251c-0.933,0 -1.483,0.394 -1.483,1.052l0,0.024c0,0.61 0.538,0.956 1.232,0.956Zm7.713,1.065c-1.877,0 -3.264,-1.471 -3.264,-3.265l0,-0.024c0,-1.794 1.387,-3.301 3.288,-3.301c1.184,0 1.925,0.443 2.523,1.089l-0.908,0.968c-0.443,-0.454 -0.909,-0.789 -1.627,-0.789c-1.052,0 -1.83,0.909 -1.83,2.009l0,0.024c0,1.124 0.778,2.021 1.89,2.021c0.682,0 1.172,-0.311 1.638,-0.777l0.873,0.861c-0.622,0.694 -1.351,1.184 -2.583,1.184Zm3.898,-0.144l0,-8.73l1.46,0l0,5.214l2.618,-2.798l1.759,0l-2.512,2.571l2.595,3.743l-1.698,0l-1.865,-2.738l-0.897,0.932l0,1.806l-1.46,0Zm6.996,-7.282l0,-1.376l1.555,0l0,1.376l-1.555,0Zm0.048,7.282l0,-6.314l1.459,0l0,6.314l-1.459,0Zm3.336,0l0,-6.314l1.46,0l0,0.969c0.406,-0.586 0.993,-1.101 1.973,-1.101c1.423,0 2.248,0.957 2.248,2.416l0,4.03l-1.447,0l0,-3.588c0,-0.98 -0.49,-1.542 -1.351,-1.542c-0.837,0 -1.423,0.586 -1.423,1.567l0,3.563l-1.46,0Zm10.237,1.937c-1.04,0 -2.009,-0.262 -2.822,-0.753l0.538,-1.088c0.682,0.418 1.388,0.657 2.248,0.657c1.292,0 1.997,-0.657 1.997,-1.925l0,-0.478c-0.526,0.669 -1.184,1.148 -2.224,1.148c-1.495,0 -2.87,-1.1 -2.87,-2.954l0,-0.024c0,-1.865 1.399,-2.966 2.87,-2.966c1.065,0 1.722,0.491 2.212,1.077l0,-0.945l1.448,0l0,5.023c0,1.064 -0.275,1.853 -0.802,2.379c-0.574,0.574 -1.459,0.849 -2.595,0.849Zm0.12,-3.671c1.005,0 1.853,-0.706 1.853,-1.734l0,-0.024c0,-1.028 -0.848,-1.722 -1.853,-1.722c-1.005,0 -1.794,0.682 -1.794,1.722l0,0.024c0,1.028 0.801,1.734 1.794,1.734Zm8.849,1.734l0,-8.371l3.732,0c1.051,0 1.877,0.311 2.415,0.837c0.442,0.455 0.694,1.077 0.694,1.806l0,0.024c0,1.375 -0.826,2.2 -1.986,2.535l2.261,3.169l-1.747,0l-2.056,-2.918l-1.842,0l0,2.918l-1.471,0Zm1.471,-4.221l2.153,0c1.052,0 1.722,-0.55 1.722,-1.4l0,-0.023c0,-0.897 -0.646,-1.388 -1.734,-1.388l-2.141,0l0,2.811Zm9.782,4.365c-1.829,0 -3.241,-1.328 -3.241,-3.277l0,-0.024c0,-1.806 1.28,-3.289 3.085,-3.289c2.01,0 3.027,1.579 3.027,3.397c0,0.131 -0.013,0.263 -0.025,0.406l-4.64,0c0.156,1.029 0.886,1.603 1.818,1.603c0.705,0 1.208,-0.263 1.71,-0.753l0.85,0.753c-0.598,0.717 -1.424,1.184 -2.584,1.184Zm-1.805,-3.744l3.24,0c-0.096,-0.932 -0.645,-1.661 -1.602,-1.661c-0.885,0 -1.507,0.681 -1.638,1.661Zm8.299,3.72c-0.897,0 -1.89,-0.311 -2.679,-0.945l0.646,-0.981c0.693,0.515 1.423,0.778 2.068,0.778c0.622,0 0.981,-0.263 0.981,-0.682l0,-0.024c0,-0.49 -0.67,-0.658 -1.411,-0.885c-0.932,-0.263 -1.973,-0.646 -1.973,-1.842l0,-0.023c0,-1.208 0.992,-1.937 2.248,-1.937c0.79,0 1.65,0.274 2.32,0.717l-0.574,1.028c-0.61,-0.37 -1.255,-0.598 -1.782,-0.598c-0.562,0 -0.885,0.275 -0.885,0.622l0,0.024c0,0.467 0.682,0.658 1.424,0.897c0.92,0.287 1.96,0.706 1.96,1.842l0,0.024c0,1.327 -1.028,1.985 -2.343,1.985Zm6.72,0.024c-1.829,0 -3.24,-1.328 -3.24,-3.277l0,-0.024c0,-1.806 1.279,-3.289 3.085,-3.289c2.009,0 3.026,1.579 3.026,3.397c0,0.131 -0.012,0.263 -0.024,0.406l-4.641,0c0.156,1.029 0.885,1.603 1.818,1.603c0.706,0 1.208,-0.263 1.71,-0.753l0.849,0.753c-0.598,0.717 -1.422,1.184 -2.583,1.184Zm-1.805,-3.744l3.24,0c-0.095,-0.932 -0.645,-1.661 -1.602,-1.661c-0.885,0 -1.507,0.681 -1.638,1.661Zm7.952,3.732c-1.184,0 -2.248,-0.682 -2.248,-1.95l0,-0.023c0,-1.364 1.076,-2.034 2.619,-2.034c0.705,0 1.208,0.108 1.698,0.264l0,-0.156c0,-0.897 -0.55,-1.375 -1.566,-1.375c-0.706,0 -1.233,0.155 -1.806,0.394l-0.395,-1.135c0.706,-0.312 1.387,-0.515 2.392,-0.515c0.944,0 1.65,0.251 2.093,0.706c0.466,0.454 0.681,1.124 0.681,1.949l0,3.743l-1.411,0l0,-0.789c-0.43,0.514 -1.089,0.921 -2.057,0.921Zm0.407,-1.053c0.956,0 1.686,-0.55 1.686,-1.351l0,-0.43c-0.371,-0.144 -0.861,-0.251 -1.435,-0.251c-0.933,0 -1.483,0.394 -1.483,1.052l0,0.024c0,0.61 0.538,0.956 1.232,0.956Zm4.783,0.921l0,-6.314l1.459,0l0,1.423c0.395,-0.945 1.124,-1.591 2.236,-1.543l0,1.531l-0.083,0c-1.268,0 -2.153,0.825 -2.153,2.499l0,2.404l-1.459,0Zm7.653,0.144c-1.877,0 -3.264,-1.471 -3.264,-3.265l0,-0.024c0,-1.794 1.387,-3.301 3.288,-3.301c1.184,0 1.926,0.443 2.524,1.089l-0.909,0.968c-0.443,-0.454 -0.909,-0.789 -1.627,-0.789c-1.051,0 -1.829,0.909 -1.829,2.009l0,0.024c0,1.124 0.778,2.021 1.889,2.021c0.682,0 1.173,-0.311 1.638,-0.777l0.874,0.861c-0.622,0.694 -1.352,1.184 -2.584,1.184Zm3.899,-0.144l0,-8.73l1.459,0l0,3.385c0.407,-0.586 0.993,-1.101 1.973,-1.101c1.424,0 2.249,0.957 2.249,2.416l0,4.03l-1.447,0l0,-3.588c0,-0.98 -0.491,-1.542 -1.352,-1.542c-0.837,0 -1.423,0.586 -1.423,1.567l0,3.563l-1.459,0Zm11.181,0l0,-8.371l6.231,0l0,1.339l-4.759,0l0,2.284l4.221,0l0,1.34l-4.221,0l0,3.408l-1.472,0Zm9.855,0.132c-1.424,0 -2.249,-0.957 -2.249,-2.428l0,-4.018l1.447,0l0,3.587c0,0.981 0.49,1.531 1.351,1.531c0.837,0 1.423,-0.574 1.423,-1.554l0,-3.564l1.459,0l0,6.314l-1.459,0l0,-0.981c-0.406,0.598 -0.992,1.113 -1.972,1.113Zm5.225,-0.132l0,-6.314l1.459,0l0,0.969c0.407,-0.586 0.993,-1.101 1.973,-1.101c1.423,0 2.249,0.957 2.249,2.416l0,4.03l-1.448,0l0,-3.588c0,-0.98 -0.49,-1.542 -1.35,-1.542c-0.838,0 -1.424,0.586 -1.424,1.567l0,3.563l-1.459,0Zm10.033,0.132c-1.482,0 -2.93,-1.184 -2.93,-3.277l0,-0.024c0,-2.092 1.421,-3.277 2.93,-3.277c1.039,0 1.696,0.515 2.152,1.113l0,-3.397l1.448,0l0,8.73l-1.448,0l0,-1.052c-0.463,0.658 -1.12,1.184 -2.152,1.184Zm0.348,-1.256c0.966,0 1.83,-0.813 1.83,-2.021l0,-0.024c0,-1.22 -0.864,-2.021 -1.83,-2.021c-0.992,0 -1.816,0.777 -1.816,2.021l0,0.024c0,1.22 0.838,2.021 1.816,2.021Zm5.095,-6.158l0,-1.376l1.555,0l0,1.376l-1.555,0Zm0.047,7.282l0,-6.314l1.461,0l0,6.314l-1.461,0Zm3.338,0l0,-6.314l1.455,0l0,0.969c0.409,-0.586 0.992,-1.101 1.978,-1.101c1.421,0 2.245,0.957 2.245,2.416l0,4.03l-1.448,0l0,-3.588c0,-0.98 -0.489,-1.542 -1.347,-1.542c-0.838,0 -1.428,0.586 -1.428,1.567l0,3.563l-1.455,0Zm10.237,1.937c-1.046,0 -2.011,-0.262 -2.822,-0.753l0.536,-1.088c0.684,0.418 1.388,0.657 2.246,0.657c1.293,0 1.997,-0.657 1.997,-1.925l0,-0.478c-0.523,0.669 -1.18,1.148 -2.225,1.148c-1.495,0 -2.869,-1.1 -2.869,-2.954l0,-0.024c0,-1.865 1.401,-2.966 2.869,-2.966c1.066,0 1.723,0.491 2.212,1.077l0,-0.945l1.448,0l0,5.023c0,1.064 -0.275,1.853 -0.798,2.379c-0.576,0.574 -1.461,0.849 -2.594,0.849Zm0.114,-3.671c1.005,0 1.857,-0.706 1.857,-1.734l0,-0.024c0,-1.028 -0.852,-1.722 -1.857,-1.722c-0.999,0 -1.79,0.682 -1.79,1.722l0,0.024c0,1.028 0.798,1.734 1.79,1.734Zm-155.949,14.488c-1.184,0 -2.248,-0.681 -2.248,-1.949l0,-0.024c0,-1.363 1.076,-2.033 2.619,-2.033c0.706,0 1.208,0.108 1.698,0.264l0,-0.156c0,-0.897 -0.55,-1.375 -1.566,-1.375c-0.706,0 -1.232,0.155 -1.806,0.394l-0.395,-1.135c0.706,-0.312 1.388,-0.515 2.392,-0.515c0.944,0 1.65,0.251 2.093,0.706c0.466,0.454 0.681,1.124 0.681,1.949l0,3.743l-1.411,0l0,-0.789c-0.431,0.514 -1.088,0.92 -2.057,0.92Zm0.407,-1.052c0.956,0 1.686,-0.55 1.686,-1.351l0,-0.431c-0.371,-0.143 -0.861,-0.251 -1.435,-0.251c-0.933,0 -1.483,0.395 -1.483,1.053l0,0.024c0,0.609 0.538,0.956 1.232,0.956Zm4.783,0.921l0,-6.314l1.459,0l0,0.969c0.407,-0.586 0.992,-1.101 1.973,-1.101c1.423,0 2.249,0.957 2.249,2.416l0,4.03l-1.448,0l0,-3.588c0,-0.98 -0.49,-1.542 -1.351,-1.542c-0.837,0 -1.423,0.586 -1.423,1.567l0,3.563l-1.459,0Zm10.033,0.131c-1.483,0 -2.929,-1.183 -2.929,-3.276l0,-0.024c0,-2.093 1.423,-3.277 2.929,-3.277c1.041,0 1.698,0.515 2.153,1.113l0,-3.397l1.447,0l0,8.73l-1.447,0l0,-1.052c-0.467,0.657 -1.124,1.183 -2.153,1.183Zm0.348,-1.255c0.968,0 1.829,-0.813 1.829,-2.021l0,-0.024c0,-1.22 -0.861,-2.021 -1.829,-2.021c-0.993,0 -1.819,0.777 -1.819,2.021l0,0.024c0,1.22 0.838,2.021 1.819,2.021Zm8.825,1.124l0,-8.371l6.206,0l0,1.315l-4.735,0l0,2.177l4.197,0l0,1.327l-4.197,0l0,2.236l4.795,0l0,1.316l-6.266,0Zm9.722,0.048l-2.595,-6.362l1.555,0l1.698,4.64l1.71,-4.64l1.518,0l-2.583,6.362l-1.303,0Zm5.142,-7.331l0,-1.375l1.554,0l0,1.375l-1.554,0Zm0.048,7.283l0,-6.314l1.459,0l0,6.314l-1.459,0Zm5.956,0.131c-1.483,0 -2.931,-1.183 -2.931,-3.276l0,-0.024c0,-2.093 1.424,-3.277 2.931,-3.277c1.04,0 1.698,0.515 2.152,1.113l0,-3.397l1.447,0l0,8.73l-1.447,0l0,-1.052c-0.466,0.657 -1.124,1.183 -2.152,1.183Zm0.346,-1.255c0.969,0 1.83,-0.813 1.83,-2.021l0,-0.024c0,-1.22 -0.861,-2.021 -1.83,-2.021c-0.993,0 -1.818,0.777 -1.818,2.021l0,0.024c0,1.22 0.837,2.021 1.818,2.021Zm7.965,1.268c-1.83,0 -3.241,-1.328 -3.241,-3.277l0,-0.024c0,-1.806 1.279,-3.289 3.085,-3.289c2.009,0 3.026,1.579 3.026,3.396c0,0.132 -0.012,0.264 -0.025,0.407l-4.639,0c0.155,1.029 0.885,1.603 1.817,1.603c0.706,0 1.208,-0.263 1.71,-0.754l0.85,0.754c-0.598,0.717 -1.423,1.184 -2.583,1.184Zm-1.806,-3.743l3.24,0c-0.095,-0.933 -0.645,-1.663 -1.602,-1.663c-0.885,0 -1.507,0.682 -1.638,1.663Zm6.122,3.599l0,-6.314l1.46,0l0,0.969c0.406,-0.586 0.992,-1.101 1.973,-1.101c1.423,0 2.248,0.957 2.248,2.416l0,4.03l-1.447,0l0,-3.588c0,-0.98 -0.49,-1.542 -1.351,-1.542c-0.837,0 -1.423,0.586 -1.423,1.567l0,3.563l-1.46,0Zm10.345,0.144c-1.877,0 -3.265,-1.471 -3.265,-3.265l0,-0.024c0,-1.794 1.388,-3.301 3.289,-3.301c1.184,0 1.925,0.443 2.523,1.088l-0.909,0.969c-0.442,-0.454 -0.909,-0.789 -1.626,-0.789c-1.053,0 -1.83,0.909 -1.83,2.009l0,0.024c0,1.124 0.777,2.021 1.889,2.021c0.682,0 1.173,-0.311 1.639,-0.777l0.873,0.861c-0.622,0.693 -1.351,1.184 -2.583,1.184Zm6.625,0c-1.83,0 -3.241,-1.328 -3.241,-3.277l0,-0.024c0,-1.806 1.279,-3.289 3.085,-3.289c2.009,0 3.026,1.579 3.026,3.396c0,0.132 -0.012,0.264 -0.024,0.407l-4.64,0c0.156,1.029 0.885,1.603 1.818,1.603c0.705,0 1.207,-0.263 1.71,-0.754l0.849,0.754c-0.598,0.717 -1.423,1.184 -2.583,1.184Zm-1.806,-3.743l3.241,0c-0.096,-0.933 -0.646,-1.663 -1.603,-1.663c-0.885,0 -1.507,0.682 -1.638,1.663Zm10.045,3.599l0,-5.071l-0.801,0l0,-1.207l0.801,0l0,-0.466c0,-0.694 0.18,-1.221 0.514,-1.555c0.336,-0.335 0.802,-0.502 1.412,-0.502c0.514,0 0.861,0.071 1.183,0.167l0,1.22c-0.286,-0.096 -0.538,-0.155 -0.848,-0.155c-0.551,0 -0.838,0.31 -0.838,0.956l0,0.347l1.674,0l0,1.195l-1.649,0l0,5.071l-1.448,0Zm7.056,0.144c-1.925,0 -3.349,-1.471 -3.349,-3.265l0,-0.024c0,-1.806 1.436,-3.301 3.373,-3.301c1.937,0 3.36,1.471 3.36,3.277l0,0.024c0,1.794 -1.435,3.289 -3.384,3.289Zm0.024,-1.268c1.172,0 1.913,-0.909 1.913,-1.997l0,-0.024c0,-1.112 -0.801,-2.033 -1.937,-2.033c-1.16,0 -1.901,0.909 -1.901,2.009l0,0.024c0,1.1 0.801,2.021 1.925,2.021Zm4.819,1.124l0,-6.314l1.459,0l0,1.423c0.395,-0.945 1.124,-1.591 2.236,-1.543l0,1.531l-0.083,0c-1.268,0 -2.153,0.825 -2.153,2.499l0,2.404l-1.459,0Zm7.988,0l3.684,-8.431l1.363,0l3.683,8.431l-1.555,0l-0.848,-2.021l-3.959,0l-0.861,2.021l-1.507,0Zm2.906,-3.324l2.882,0l-1.446,-3.349l-1.436,3.349Zm9.711,3.468c-1.877,0 -3.265,-1.471 -3.265,-3.265l0,-0.024c0,-1.794 1.388,-3.301 3.289,-3.301c1.184,0 1.925,0.443 2.523,1.088l-0.909,0.969c-0.442,-0.454 -0.909,-0.789 -1.626,-0.789c-1.053,0 -1.83,0.909 -1.83,2.009l0,0.024c0,1.124 0.777,2.021 1.889,2.021c0.682,0 1.173,-0.311 1.639,-0.777l0.873,0.861c-0.622,0.693 -1.351,1.184 -2.583,1.184Zm6.027,-0.036c-1.065,0 -1.818,-0.467 -1.818,-1.854l0,-3.325l-0.801,0l0,-1.243l0.801,0l0,-1.734l1.447,0l0,1.734l1.698,0l0,1.243l-1.698,0l0,3.098c0,0.562 0.287,0.789 0.778,0.789c0.322,0 0.609,-0.072 0.896,-0.215l0,1.184c-0.359,0.203 -0.753,0.323 -1.303,0.323Zm2.822,-7.391l0,-1.375l1.555,0l0,1.375l-1.555,0Zm0.048,7.283l0,-6.314l1.459,0l0,6.314l-1.459,0Zm6.35,0.144c-1.925,0 -3.348,-1.471 -3.348,-3.265l0,-0.024c0,-1.806 1.435,-3.301 3.372,-3.301c1.938,0 3.361,1.471 3.361,3.277l0,0.024c0,1.794 -1.436,3.289 -3.385,3.289Zm0.024,-1.268c1.172,0 1.913,-0.909 1.913,-1.997l0,-0.024c0,-1.112 -0.801,-2.033 -1.937,-2.033c-1.16,0 -1.902,0.909 -1.902,2.009l0,0.024c0,1.1 0.802,2.021 1.926,2.021Zm4.822,1.124l0,-6.314l1.455,0l0,0.969c0.409,-0.586 0.992,-1.101 1.977,-1.101c1.422,0 2.246,0.957 2.246,2.416l0,4.03l-1.448,0l0,-3.588c0,-0.98 -0.489,-1.542 -1.354,-1.542c-0.831,0 -1.421,0.586 -1.421,1.567l0,3.563l-1.455,0Z"
                    fill="#00003d"
                />
            </g>
            <g>
                <path
                    d="M21.478,45.829l0,-18.253l7.456,0c4.355,0 6.988,2.581 6.988,6.311l0,0.051c0,4.222 -3.285,6.412 -7.378,6.412l-3.051,0l0,5.479l-4.015,0Zm4.015,-9.051l3.181,0c2.007,0 3.181,-1.199 3.181,-2.764l0,-0.051c0,-1.799 -1.252,-2.764 -3.26,-2.764l-3.102,0l0,5.579Zm10.012,9.051l7.821,-18.386l3.702,0l7.821,18.386l-4.197,0l-1.669,-4.096l-7.717,0l-1.668,4.096l-4.093,0Zm7.195,-7.643l4.849,0l-2.424,-5.914l-2.425,5.914Zm14.965,7.643l0,-18.253l3.702,0l8.551,11.234l0,-11.234l3.963,0l0,18.253l-3.415,0l-8.838,-11.607l0,11.607l-3.963,0Zm20.597,0l0,-18.253l7.117,0c5.736,0 9.698,3.938 9.698,9.076l0,0.05c0,5.138 -3.962,9.127 -9.698,9.127l-7.117,0Zm7.117,-14.63l-3.103,0l0,11.001l3.103,0c3.285,0 5.501,-2.216 5.501,-5.447l0,-0.051c0,-3.231 -2.216,-5.503 -5.501,-5.503Zm13.27,14.63l0,-18.253l13.766,0l0,3.572l-9.777,0l0,3.705l8.603,0l0,3.572l-8.603,0l0,3.832l9.907,0l0,3.572l-13.896,0Zm17.468,0l0,-18.253l4.328,0l4.797,7.719l4.797,-7.719l4.327,0l0,18.253l-3.988,0l0,-11.916l-5.136,7.794l-0.104,0l-5.084,-7.719l0,11.841l-3.937,0Zm26.827,-18.253l0,18.25l-4.015,0l0,-18.25l4.015,0Zm13.114,18.562c-5.371,0 -9.36,-4.147 -9.36,-9.385l0,-0.051c0,-5.188 3.911,-9.442 9.516,-9.442c3.442,0 5.501,1.149 7.196,2.821l-2.555,2.942c-1.408,-1.275 -2.842,-2.058 -4.667,-2.058c-3.076,0 -5.292,2.556 -5.292,5.687l0,0.05c0,3.131 2.164,5.738 5.292,5.738c2.086,0 3.364,-0.84 4.797,-2.14l2.555,2.581c-1.877,2.007 -3.962,3.257 -7.482,3.257Zm-134.58,22.034l0,-18.247l7.456,-0c4.355,-0 6.988,2.582 6.988,6.305l0,0.057c0,4.223 -3.285,6.413 -7.378,6.413l-3.051,-0l0,5.472l-4.015,0Zm4.015,-9.045l3.181,0c2.007,0 3.181,-1.199 3.181,-2.764l0,-0.051c0,-1.798 -1.252,-2.764 -3.26,-2.764l-3.102,0l0,5.579Zm10.012,9.045l7.821,-18.379l3.702,0l7.821,18.379l-4.197,0l-1.669,-4.09l-7.717,0l-1.668,4.09l-4.093,0Zm7.195,-7.637l4.849,0l-2.424,-5.92l-2.425,5.92Zm22.343,7.953c-5.37,0 -9.359,-4.147 -9.359,-9.386l0,-0.057c0,-5.188 3.91,-9.435 9.516,-9.435c3.441,0 5.501,1.148 7.196,2.815l-2.555,2.947c-1.408,-1.275 -2.842,-2.058 -4.667,-2.058c-3.077,0 -5.293,2.557 -5.293,5.681l0,0.05c0,3.131 2.164,5.738 5.293,5.738c2.085,0 3.363,-0.833 4.797,-2.14l2.555,2.581c-1.877,2.008 -3.963,3.264 -7.483,3.264Zm14.939,-0.316l0,-14.548l-5.553,0l0,-3.699l15.121,0l0,3.699l-5.553,0l0,14.548l-4.015,0Z"
                    fill="#00003d"
                />
            </g>
        </svg>
    );

    const partnerLinkWrapperClasses = [
        'mt-2 md:mt-6 xl:mt-0',
        'relative bg-[#F9FAFB] rounded-2xl md:col-span-2',
        'px-6 py-6 lg:px-8 lg:py-8',
        'border-dotted border-2 border-primary',
    ].filter(Boolean).join(' ');

    return (
        <>
        <footer className="pt-12 bg-gradient-to-t from-primary/30">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 xl:grid-cols-5">
                    <div className="md:h-full grid md:content-between md:items-start gap-10 xl:col-span-2">
                        <div className="max-w-[16rem] lg:max-w-[18rem] mx-auto md:mx-0">
                            <Logo />
                        </div>
                        <p className="text-gray-700 text-balance text-base text-center md:text-left max-w-lg mx-auto md:mx-0">
                            {`Delivering insights from over: \$${homepageTotals.totalCommittedUsd.finalCount} ${homepageTotals.totalCommittedUsd.suffix} in research funding across ${Number(homepageTotals.totalGrants.finalCount).toLocaleString()} grants, from ${homepageTotals.totalFunders.finalCount} global funders`}
                        </p>
                    </div>

                    <div className="text-center xl:text-left h-full flex flex-col gap-4 lg:gap-8 2xl:gap-10">
                        <h2 className="text-gray-700 uppercase font-bold text-sm">
                            Discover
                        </h2>
                        <ul className="grow grid content-between items-start gap-3">
                            {footerLinksFirstCollection
                                .filter((link) => link.label !== 'About')
                                .map((link, index) => (
                                    <NavItem key={index} {...link} />
                                ))}
                        </ul>
                    </div>

                    <div className={partnerLinkWrapperClasses}>
                        <h2 className="absolute inset-x-0 -mt-10 lg:-mt-12 text-center">
                            <span className="mx-auto inline-block px-3 py-1 text-gray-500 rounded-full font-bold tracking-widest uppercase bg-gray-50">
                                Our partners
                            </span>
                        </h2>
                        <ul className="h-full grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-2">
                            {footerLinksSecondCollection.map(
                                (link: imageLinkProps, index: number) => {
                                    const classes = [
                                        'relative flex w-full px-4 py-3 bg-white rounded-xl border-2 border-gray-200 group',
                                        'transition duration-300 hover:shadow-md hover:scale-[1.02]',
                                        link.classes && link.classes,
                                    ].filter(Boolean).join(' ');

                                    return (
                                        <li key={index} className={classes}>
                                            <a
                                                href={link.href}
                                                className="w-full flex items-center justify-center"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Image
                                                    src={link.src}
                                                    alt={link.alt}
                                                    width={link.width}
                                                    height={link.height}
                                                    className="w-full pr-4 max-w-xs mx-auto md:px-1 md:pr-4 xl:px-4 2xl:px-6"
                                                />
                                                <ExternalLinkIcon className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 size-4 duration-300 transition-colors group-hover:text-secondary" />
                                            </a>
                                        </li>
                                    );
                                }
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="mt-12 lg:mt-20 bg-white pt-6 max-lg:pb-24 lg:py-6">
                <div className="container">
                    <div className="flex flex-col items-center gap-4 lg:gap-20 lg:flex-row lg:justify-between">
                        <FooterCopyrightStatement className="text-balance text-center lg:text-left text-gray-700" />

                        <div className="print:hidden">
                            <FooterMenu />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
        </>
    );
}
